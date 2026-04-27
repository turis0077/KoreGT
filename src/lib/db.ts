import { Pool } from 'pg';

// Crear una instancia única del Pool para ser reutilizada en la aplicación
// Se alimenta obligatoriamente de las variables de entorno de la rúbrica (proy2/secret)
const pool = new Pool({
  user: process.env.DB_USER || 'proy2',
  password: process.env.DB_PASSWORD || 'secret',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres', // En nuestra db inicial el nombre por defecto de la base es postgres
});

/**
 * Ejecuta una consulta simple de SQL puro a la base de datos.
 * Útil para operaciones de una sola línea (SELECTs, INSERTs básicos sin transacción).
 * 
 * @param text Instrucción SQL pura.
 * @param params Parámetros sanitizados (Array) para prevenir SQL Injection.
 */
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  // Solo con fines de depuración en desarrollo, puedes comentarlo en prod
  console.log('Ejecutada consulta', { text, duration, filasRetornadas: res.rowCount });
  return res;
};

/**
 * Obtiene un cliente dedicado del pool.
 * ESTO ES OBLIGATORIO Y CRÍTICO para ejecutar Transacciones ACID (BEGIN, COMMIT, ROLLBACK).
 * Garantiza que múltiples instrucciones SQL se ejecuten sobre el mismo túnel de conexión.
 * 
 * IMPORTANTE: Recuerda siempre ejecutar `client.release()` al finalizar, 
 * en un bloque `finally {}`.
 */
export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

export default pool;
