import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET() {
  try {
    const text = `
      SELECT DISTINCT c.id_categoria, c.nombre, c.slug, c.descripcion 
      FROM categorias c 
      INNER JOIN productos p ON p.id_categoria = c.id_categoria 
      ORDER BY c.nombre ASC
    `;
    const result = await query(text);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching categorias:', error);
    return NextResponse.json({ error: 'Error fetching categories' }, { status: 500 });
  }
}
