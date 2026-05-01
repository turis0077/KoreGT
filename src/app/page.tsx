'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '../components/ProductCard';
import './catalogo.css';

// El contenido de la página debe estar envuelto en Suspense si usa useSearchParams
function CatalogoContent() {
  const searchParams = useSearchParams();
  const categoriaSlug = searchParams.get('categoria');
  const search = searchParams.get('search')?.toLowerCase();

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/productos')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          let filtrados = data;
          
          if (categoriaSlug) {
            filtrados = filtrados.filter((p: any) => 
              p.categoria_slug === categoriaSlug
            );
          }
          
          if (search) {
            filtrados = filtrados.filter((p: any) => 
              p.nombre.toLowerCase().includes(search) || 
              p.descripcion.toLowerCase().includes(search)
            );
          }
          
          setProductos(filtrados);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }, [categoriaSlug, search]);

  if (loading) return <div className="loader">Cargando hardware premium...</div>;

  return (
    <div className="catalogo-container">
      <div className="catalogo-header">
        <h1>Hardware <span>Premium</span></h1>
        <p>Descubre nuestra selección exclusiva de componentes tecnológicos, procesadores, tarjetas gráficas y más.</p>
      </div>

      {productos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
          <h2>No se encontraron productos en esta categoría.</h2>
        </div>
      ) : (
        <div className="productos-grid">
          {productos.map((p: any) => (
            <ProductCard key={p.id_producto} producto={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="loader">Iniciando catálogo...</div>}>
      <CatalogoContent />
    </Suspense>
  );
}
