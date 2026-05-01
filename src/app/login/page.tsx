import Link from 'next/link';
import '../static.css';

export default function LoginPage() {
  return (
    <div className="static-container" style={{ maxWidth: '600px' }}>
      <div className="static-header">
        <h1>Iniciar <span>Sesión</span></h1>
        <p>Accede a tu cuenta Premium</p>
      </div>
      <div className="static-content glass-panel" style={{ padding: '3rem' }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Correo Electrónico</label>
            <input type="email" placeholder="tu@correo.com" style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Contraseña</label>
            <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)' }} />
          </div>
          <button type="button" className="btn-primary" style={{ marginTop: '1rem' }}>Ingresar</button>
        </form>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Link href="/" style={{ color: 'var(--accent)' }}>¿Olvidaste tu contraseña?</Link>
        </div>
      </div>
    </div>
  );
}
