import Link from 'next/link';
import './layout.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>KOREGT</h3>
          <p>La tienda de hardware y componentes más premium de Guatemala.</p>
        </div>
        <div className="footer-section">
          <h3>Enlaces Rápidos</h3>
          <Link href="/">Catálogo Completo</Link>
          <Link href="/ofertas">Ofertas Exclusivas</Link>
          <Link href="/contacto">Soporte Técnico</Link>
        </div>
        <div className="footer-section">
          <h3>Legal</h3>
          <Link href="/terminos">Términos y Condiciones</Link>
          <Link href="/privacidad">Política de Privacidad</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} KoreGT Premium Tech Store. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
