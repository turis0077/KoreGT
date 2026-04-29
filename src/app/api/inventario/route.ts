import { NextResponse } from 'next/server';
import { getClient } from '../../../lib/db';

export async function POST(request: Request) {
  // Obtiene un túnel de conexión dedicado para asegurar la transacción ACID
  const client = await getClient();
  
  try {
    const { id_producto, cantidad, id_usuario_resp } = await request.json();

    if (!id_producto || !cantidad || !id_usuario_resp) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    if (cantidad <= 0) {
      return NextResponse.json({ error: 'La cantidad debe ser mayor a 0' }, { status: 400 });
    }

    // INICIO DE LA TRANSACCIÓN ACID
    await client.query('BEGIN');

    // 1. Obtener el stock actual y bloquear la fila para prevenir race conditions (FOR UPDATE)
    const resProducto = await client.query(
      'SELECT stock_actual, stock_maximo FROM productos WHERE id_producto = $1 FOR UPDATE',
      [id_producto]
    );

    if (resProducto.rowCount === 0) {
      throw new Error('Producto no encontrado');
    }

    const { stock_actual, stock_maximo } = resProducto.rows[0];
    const stock_despues = stock_actual + cantidad;

    if (stock_despues > stock_maximo) {
      throw new Error(`El ingreso supera el stock máximo permitido (${stock_maximo})`);
    }

    // 2. Actualizar el stock en la tabla productos
    await client.query(
      'UPDATE productos SET stock_actual = $1 WHERE id_producto = $2',
      [stock_despues, id_producto]
    );

    // 3. Registrar el movimiento en la bitácora obligatoria
    await client.query(
      `INSERT INTO movimientos_inventario 
      (id_producto, tipo, cantidad, stock_antes, stock_despues, referencia, id_usuario_resp) 
      VALUES ($1, 'entrada', $2, $3, $4, 'Ingreso manual de inventario', $5)`,
      [id_producto, cantidad, stock_actual, stock_despues, id_usuario_resp]
    );

    // CONFIRMAR TRANSACCIÓN
    await client.query('COMMIT');

    return NextResponse.json({ 
      mensaje: 'Inventario actualizado correctamente',
      stock_actual: stock_despues 
    });

  } catch (error: any) {
    // REVERTIR TRANSACCIÓN EN CASO DE CUALQUIER ERROR
    await client.query('ROLLBACK');
    console.error('Error en transacción de inventario:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  } finally {
    // SIEMPRE SE DEBE LIBERAR EL CLIENTE PARA NO SATURAR EL POOL
    client.release();
  }
}
