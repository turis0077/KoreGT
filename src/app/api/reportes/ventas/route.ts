import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import crypto from 'crypto';

export async function GET(request: Request) {
  try {
    // 1. Verificación de Seguridad y Permisos de Administrador
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado. Faltan credenciales.' }, { status: 401 });
    }

    const rawToken = authHeader.split(' ')[1];
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Verificar si el token es válido y si el usuario tiene rol de Administrador
    const authCheck = await query(`
      SELECT r.nombre as rol 
      FROM sesiones s 
      JOIN usuarios u ON s.id_usuario = u.id_usuario 
      JOIN roles_usuario r ON u.id_rol = r.id_rol 
      WHERE s.token_hash = $1 AND s.activa = true AND s.expira_en > CURRENT_TIMESTAMP
    `, [tokenHash]);

    if (!authCheck.rowCount || authCheck.rowCount === 0) {
      return NextResponse.json({ error: 'Sesión inválida o expirada' }, { status: 401 });
    }

    const userRole = authCheck.rows[0].rol.toLowerCase();
    if (userRole !== 'administrador' && userRole !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado. Se requieren permisos de Administrador.' }, { status: 403 });
    }

    // 2. Ejecutar la consulta contra la VISTA precalculada (reporte_ventas_productos)
    // Esto es rapidísimo porque Postgres ya maneja la lógica de JOINs y SUMs dentro de la View.
    const text = `SELECT * FROM reporte_ventas_productos ORDER BY ingresos_totales DESC`;
    const result = await query(text);

    return NextResponse.json({
      mensaje: 'Reporte generado con éxito',
      total_registros: result.rowCount,
      data: result.rows
    });

  } catch (error: any) {
    console.error('Error generando reporte de ventas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
