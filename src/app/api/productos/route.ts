import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET() {
  try {
    const text = `
      SELECT p.*, c.nombre as categoria_nombre, pr.nombre as proveedor_nombre,
             (SELECT url FROM imagenes_producto ip WHERE ip.id_producto = p.id_producto AND ip.es_principal = true LIMIT 1) as imagen_principal
      FROM productos p
      JOIN categorias c ON p.id_categoria = c.id_categoria
      JOIN proveedores pr ON p.id_proveedor = pr.id_proveedor
      WHERE p.activo = true
      ORDER BY p.id_producto ASC
    `;
    const result = await query(text);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching productos:', error);
    return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });
  }
}
