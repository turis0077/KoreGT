import { NextResponse } from 'next/server';
import { getClient } from '../../../lib/db';

export async function POST(request: Request) {
  // Conexión exclusiva para el bloque ACID
  const client = await getClient();

  try {
    const { id_usuario, id_direccion, id_envio_metodo, id_pago_metodo, items } = await request.json();

    if (!id_usuario || !id_direccion || !id_envio_metodo || !id_pago_metodo || !items || items.length === 0) {
      return NextResponse.json({ error: 'Faltan datos requeridos para el checkout' }, { status: 400 });
    }

    // INICIAR TRANSACCIÓN MULTI-TABLA
    await client.query('BEGIN');

    // 1. Snapshot Inmutable de Dirección
    const resDir = await client.query('SELECT * FROM direcciones WHERE id_direccion = $1', [id_direccion]);
    if (!resDir.rowCount || resDir.rowCount === 0) throw new Error('Dirección no válida');
    const dir = resDir.rows[0];
    const direccion_snapshot = `${dir.direccion_linea1}, ${dir.municipio}, ${dir.departamento}. Ref: ${dir.referencia || 'N/A'}`;

    // 2. Snapshot de Costo de Envío
    const resEnvio = await client.query('SELECT costo FROM metodos_envio WHERE id_envio_metodo = $1', [id_envio_metodo]);
    if (!resEnvio.rowCount || resEnvio.rowCount === 0) throw new Error('Método de envío no válido');
    const costo_envio = parseFloat(resEnvio.rows[0].costo);

    let subtotal_orden = 0;
    const itemsProcesados = [];

    // 3. Procesar integridad de cada producto en el carrito
    for (const item of items) {
      // FOR UPDATE congela el inventario de estos productos hasta que hagamos COMMIT
      const resProd = await client.query(
        'SELECT precio_unitario, stock_actual FROM productos WHERE id_producto = $1 FOR UPDATE',
        [item.id_producto]
      );

      if (!resProd.rowCount || resProd.rowCount === 0) throw new Error(`Producto ID ${item.id_producto} no encontrado`);
      
      const { precio_unitario, stock_actual } = resProd.rows[0];
      
      if (stock_actual < item.cantidad) {
        throw new Error(`Stock insuficiente para producto ID ${item.id_producto}. Disp: ${stock_actual}`);
      }

      const precio = parseFloat(precio_unitario);
      const subtotal_item = precio * item.cantidad;
      subtotal_orden += subtotal_item;

      // 4. Descontar Inventario Inmediatamente
      const stock_despues = stock_actual - item.cantidad;
      await client.query('UPDATE productos SET stock_actual = $1 WHERE id_producto = $2', [stock_despues, item.id_producto]);

      // 5. Dejar Rastro en la Auditoría de Movimientos
      await client.query(
        `INSERT INTO movimientos_inventario 
        (id_producto, tipo, cantidad, stock_antes, stock_despues, referencia, id_usuario_resp) 
        VALUES ($1, 'venta', $2, $3, $4, 'Venta generada en checkout', $5)`,
        [item.id_producto, item.cantidad, stock_actual, stock_despues, id_usuario]
      );

      itemsProcesados.push({
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_snapshot: precio,
        subtotal: subtotal_item
      });
    }

    const total_orden = subtotal_orden + costo_envio;
    const codigo_orden = `ORD-${Date.now()}`;

    // 6. Crear la Orden (Cabecera)
    const resOrden = await client.query(
      `INSERT INTO ordenes 
      (codigo_orden, id_usuario, id_direccion, direccion_snapshot, id_envio_metodo, id_pago_metodo, subtotal, costo_envio, total, estado) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'creada') RETURNING id_orden`,
      [codigo_orden, id_usuario, id_direccion, direccion_snapshot, id_envio_metodo, id_pago_metodo, subtotal_orden, costo_envio, total_orden]
    );
    
    const id_orden = resOrden.rows[0].id_orden;

    // 7. Insertar el Detalle de la Orden
    for (const ip of itemsProcesados) {
      await client.query(
        `INSERT INTO orden_items (id_orden, id_producto, cantidad, precio_unitario_snapshot, subtotal) 
        VALUES ($1, $2, $3, $4, $5)`,
        [id_orden, ip.id_producto, ip.cantidad, ip.precio_snapshot, ip.subtotal]
      );
    }

    // 8. Programar el Envío Logístico
    // El GT-XXXXXX se autogenerará vía DEFAULT Constraint en Postgres
    await client.query(
      `INSERT INTO envios (id_orden, estado_envio) VALUES ($1, 'pendiente')`,
      [id_orden]
    );

    // 9. Registrar Pendiente de Cobro
    await client.query(
      `INSERT INTO pagos (id_orden, id_pago_metodo, monto, estado) VALUES ($1, $2, $3, 'pendiente')`,
      [id_orden, id_pago_metodo, total_orden]
    );

    // SELLAR TODA LA COMPRA
    await client.query('COMMIT');

    return NextResponse.json({ 
      mensaje: 'Orden de compra procesada con éxito',
      id_orden,
      codigo_orden,
      total_pagar: total_orden
    });

  } catch (error: any) {
    // ABORTAR TOTALMENTE SI FALLA ALGO (Ej. sin stock en el último ítem)
    await client.query('ROLLBACK');
    console.error('Error procesando checkout:', error);
    return NextResponse.json({ error: error.message || 'Fallo durante el procesamiento de orden' }, { status: 500 });
  } finally {
    client.release(); // Libera siempre
  }
}
