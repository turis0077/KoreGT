import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export async function POST(request: Request) {
  try {
    const { nombre, descripcion, precio_unitario, stock_actual, stock_maximo, id_categoria, id_proveedor } = await request.json();
    const result = await query(
      `INSERT INTO productos 
      (nombre, descripcion, precio_unitario, stock_actual, stock_maximo, id_categoria, id_proveedor) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [nombre, descripcion, precio_unitario, stock_actual, stock_maximo || 100, id_categoria || 1, id_proveedor || 1]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id_producto, nombre, descripcion, precio_unitario, stock_actual } = await request.json();
    const result = await query(
      'UPDATE productos SET nombre = $1, descripcion = $2, precio_unitario = $3, stock_actual = $4 WHERE id_producto = $5 RETURNING *',
      [nombre, descripcion, precio_unitario, stock_actual, id_producto]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id_producto } = await request.json();
    // Primero borrar imágenes para no romper foreign keys
    await query('DELETE FROM imagenes_producto WHERE id_producto = $1', [id_producto]);
    // Luego borrar el producto
    await query('DELETE FROM productos WHERE id_producto = $1', [id_producto]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'No se pudo eliminar el producto. ' + error.message }, { status: 500 });
  }
}
