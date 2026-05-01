import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export async function POST(request: Request) {
  try {
    const { nombre, slug, descripcion } = await request.json();
    const result = await query(
      'INSERT INTO categorias (nombre, slug, descripcion) VALUES ($1, $2, $3) RETURNING *',
      [nombre, slug, descripcion]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id_categoria, nombre, slug, descripcion } = await request.json();
    const result = await query(
      'UPDATE categorias SET nombre = $1, slug = $2, descripcion = $3 WHERE id_categoria = $4 RETURNING *',
      [nombre, slug, descripcion, id_categoria]
    );
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id_categoria } = await request.json();
    await query('DELETE FROM categorias WHERE id_categoria = $1', [id_categoria]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    // Si la categoría tiene productos, Postgres lanzará un error de Foreign Key. Lo capturamos.
    return NextResponse.json({ error: 'No se puede borrar porque la categoría tiene productos asociados.' }, { status: 500 });
  }
}
