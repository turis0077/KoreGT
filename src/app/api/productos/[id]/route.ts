import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Next.js App Router (versiones recientes) requiere resolver los parámetros asíncronamente
    const { id } = await params;

    const text = `
      SELECT p.*, c.nombre as categoria_nombre, pr.nombre as proveedor_nombre
      FROM productos p
      JOIN categorias c ON p.id_categoria = c.id_categoria
      JOIN proveedores pr ON p.id_proveedor = pr.id_proveedor
      WHERE p.id_producto = $1 AND p.activo = true
    `;
    // Sanitizado contra SQL Injection usando parámetros de pg ($1)
    const result = await query(text, [id]);

    if (!result.rowCount || result.rowCount === 0) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    const product = result.rows[0];

    // Obtener las imágenes del producto
    const imgText = `SELECT * FROM imagenes_producto WHERE id_producto = $1 ORDER BY orden ASC`;
    const imgResult = await query(imgText, [id]);
    product.imagenes = imgResult.rows;

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Error fetching producto:', error);
    return NextResponse.json({ error: 'Error fetching product' }, { status: 500 });
  }
}
