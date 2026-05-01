import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export async function GET() {
  try {
    // 1. Usamos la VISTA "reporte_ventas_productos" que ya existe en Postgres.
    // 2. Usamos CTE (WITH) para calcular los subtotales por categoría.
    // 3. Usamos GROUP BY y HAVING dentro de la CTE.
    const text = `
      WITH CategoriasDestacadas AS (
          SELECT categoria, SUM(ingresos_totales) as ingresos_categoria
          FROM reporte_ventas_productos
          GROUP BY categoria
          HAVING SUM(ingresos_totales) > 0
      )
      SELECT 
          r.sku,
          r.producto,
          r.categoria,
          r.proveedor,
          r.total_unidades_vendidas,
          r.ingresos_totales,
          r.stock_actual,
          c.ingresos_categoria 
      FROM reporte_ventas_productos r
      JOIN CategoriasDestacadas c ON r.categoria = c.categoria
      ORDER BY r.ingresos_totales DESC;
    `;
    const result = await query(text);
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching reporte:', error);
    return NextResponse.json({ error: 'Error fetching reporte' }, { status: 500 });
  }
}
