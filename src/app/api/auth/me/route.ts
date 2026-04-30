import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import crypto from 'crypto';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Extraer token
    const rawToken = authHeader.split(' ')[1];
    
    // Calcular el Hash para buscar en DB
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Buscar la sesión válida que no haya expirado ni haya sido revocada (activa = true)
    const text = `
      SELECT u.id_usuario, u.nombre_completo, u.correo, u.telefono, r.nombre as rol
      FROM sesiones s
      JOIN usuarios u ON s.id_usuario = u.id_usuario
      JOIN roles_usuario r ON u.id_rol = r.id_rol
      WHERE s.token_hash = $1 
        AND s.activa = true 
        AND s.expira_en > CURRENT_TIMESTAMP 
        AND u.activo = true
    `;
    const result = await query(text, [tokenHash]);

    if (!result.rowCount || result.rowCount === 0) {
      return NextResponse.json({ error: 'Sesión inválida o expirada' }, { status: 401 });
    }

    // Retornar la información del usuario autenticado
    return NextResponse.json(result.rows[0]);

  } catch (error: any) {
    console.error('Error validando sesión:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
