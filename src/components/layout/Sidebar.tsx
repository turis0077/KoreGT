'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import './layout.css';

export default function Sidebar() {
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    // Alimenta dinámicamente las categorías desde la BD
    fetch('/api/categorias')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setCategorias(data);
      })
      .catch(console.error);
  }, []);

  return (
    <aside className="sidebar">
      <h3 className="sidebar-title">Descubre</h3>
      <ul className="sidebar-list">
        <li>
          <Link href="/catalogo" className="sidebar-link">Todo el Catálogo</Link>
        </li>
        {categorias.map((c: any) => (
          <li key={c.id_categoria}>
            <Link href={`/catalogo?categoria=${c.slug}`} className="sidebar-link">
              {c.nombre}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
