import Link from 'next/link';
import '../static.css';

export default function OfertasPage() {
  return (
    <div className="static-container">
      <div className="static-header">
        <h1>Ofertas <span>Exclusivas</span></h1>
        <p>Los mejores precios en hardware premium</p>
      </div>
      <div className="static-content glass-panel">
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Próximamente</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Estamos preparando ofertas increíbles para ti. ¡Vuelve pronto!</p>
          <Link href="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '2rem' }}>
            Volver al Catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}
