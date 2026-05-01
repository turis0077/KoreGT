import Link from 'next/link';
import '../static.css';

export default function ContactoPage() {
  return (
    <div className="static-container" style={{ maxWidth: '800px' }}>
      <div className="static-header">
        <h1>Soporte <span>Técnico</span></h1>
        <p>Estamos aquí para ayudarte. Contáctanos.</p>
      </div>
      <div className="static-content glass-panel">
        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Nombre</label>
            <input type="text" placeholder="Tu nombre" style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Correo Electrónico</label>
            <input type="email" placeholder="tu@correo.com" style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Mensaje</label>
            <textarea rows={5} placeholder="¿En qué te podemos ayudar?" style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text)', resize: 'vertical' }}></textarea>
          </div>
          <button type="button" className="btn-primary" style={{ marginTop: '1rem' }}>Enviar Mensaje</button>
        </form>
      </div>
    </div>
  );
}
