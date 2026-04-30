'use client';

import Link from 'next/link';
import { useTheme } from '../ThemeProvider';
import './layout.css'; // Crearemos esto para los estilos de layout específicos

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <span className="logo-text">KORE<span className="logo-accent">GT</span></span>
        </Link>

        {/* Buscador */}
        <div className="navbar-search">
          <input 
            type="text" 
            placeholder="Buscar productos premium..." 
            className="search-input"
          />
          <button className="search-btn">
            🔍
          </button>
        </div>

        {/* Iconos de Acción */}
        <div className="navbar-actions">
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Theme">
            {isDark ? '☀️' : '🌙'}
          </button>
          
          <Link href="/carrito" className="cart-icon">
            🛒
            <span className="cart-badge">0</span>
          </Link>

          <Link href="/login" className="user-icon">
            👤
          </Link>
        </div>
      </div>
    </nav>
  );
}
