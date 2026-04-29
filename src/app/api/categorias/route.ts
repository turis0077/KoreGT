import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET() {
  try {
    const text = `SELECT * FROM categorias ORDER BY nombre ASC`;
    const result = await query(text);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching categorias:', error);
    return NextResponse.json({ error: 'Error fetching categories' }, { status: 500 });
  }
}
