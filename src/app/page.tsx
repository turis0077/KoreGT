'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '../components/ProductCard';
import './catalogo.css';

// El contenido de la página debe estar envuelto en Suspense si usa useSearchParams
function CatalogoContent() {
  const searchParams = useSearchParams();
  const categoriaSlug = searchParams.get('categoria');

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Consumir el endpoint construido en el Commit 7
    fetch('/api/productos')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          // Filtrado básico en cliente para efectos de la demostración
          if (categoriaSlug) {
            // Se asume que el backend trae la categoria en formato string, 
            // Para robustez se debería filtrar por slug real, pero para el UI validamos el string
            const filtrados = data.filter((p: any) => 
              p.categoria_nombre.toLowerCase().replace(/ /g, '-') === categoriaSlug
            );
            setProductos(filtrados);
          } else {
            setProductos(data);
          }
        }
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }, [categoriaSlug]);

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
