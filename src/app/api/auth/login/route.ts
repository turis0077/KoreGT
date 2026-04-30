import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { correo, contrasena } = await request.json();

    if (!correo || !contrasena) {
      return NextResponse.json({ error: 'Correo y contraseña obligatorios' }, { status: 400 });
    }

    // 1. Buscar usuario
    const userRes = await query('SELECT id_usuario, contrasena_hash, id_rol FROM usuarios WHERE correo = $1 AND activo = true', [correo]);
    if (!userRes.rowCount || userRes.rowCount === 0) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    const user = userRes.rows[0];

    // 2. Verificar Hash (SHA-256)
    const hash = crypto.createHash('sha256').update(contrasena).digest('hex');
    if (hash !== user.contrasena_hash) {
      return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    }

    // 3. Crear Token de Sesión seguro
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // 4. Extraer metadata del cliente (IP y User-Agent) si está disponible
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // 5. Insertar en la tabla sesiones (Activa y expiración en 24h)
    await query(
      `INSERT INTO sesiones (id_usuario, token_hash, ip, user_agent, expira_en, activa) 
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP + INTERVAL '1 day', true)`,
      [user.id_usuario, tokenHash, ip, userAgent]
    );

    return NextResponse.json({ 
      mensaje: 'Login exitoso', 
      token: rawToken, // Se devuelve el crudo al cliente
      id_usuario: user.id_usuario,
      id_rol: user.id_rol
    });

  } catch (error: any) {
    console.error('Error en login:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
