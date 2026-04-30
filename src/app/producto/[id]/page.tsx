'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import './producto.css';

export default function ProductoDetail() {
  const params = useParams();
  const id = params?.id as string;
  
  const [producto, setProducto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [imagenActiva, setImagenActiva] = useState('');
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    // Llama a nuestro API robusto del Commit 7
    fetch(`/api/productos/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Hardware no encontrado en nuestros registros');
        return res.json();
      })
      .then(data => {
        setProducto(data);
        
        // Define la imagen principal o un placeholder si no hay
        const imgPrincipal = data.imagenes?.find((img: any) => img.es_principal)?.url 
                          || data.imagenes?.[0]?.url 
                          || 'https://via.placeholder.com/600x600?text=KoreGT+Hardware';
        setImagenActiva(imgPrincipal);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="loader">Cargando especificaciones técnicas...</div>;
  if (error) return <div style={{textAlign: 'center', padding: '6rem'}}><h2>{error}</h2><Link href="/" className="btn-details" style={{marginTop: '2rem', display: 'inline-block'}}>Volver al catálogo</Link></div>;
  if (!producto) return null;

  // Manejo robusto del campo JSONB (especificaciones)
  let especificaciones = {};
  try {
    if (typeof producto.especificaciones === 'string') {
      especificaciones = JSON.parse(producto.especificaciones);
    } else if (producto.especificaciones) {
      especificaciones = producto.especificaciones;
    }
  } catch(e) {
    console.error("Error parseando especificaciones", e);
  }

  // Lógica de Semáforo de Inventario
  let stockClass = 'in-stock';
  let stockText = 'Disponible para Envío Inmediato';
  if (producto.stock_actual === 0) {
    stockClass = 'out-of-stock';
    stockText = 'Agotado Temporalmente';
  } else if (producto.stock_actual < 5) {
    stockClass = 'low-stock';
    stockText = `¡Atención! Quedan únicamente ${producto.stock_actual} unidades`;
  }

  const handleAddCantidad = () => {
    if (cantidad < producto.stock_actual) setCantidad(prev => prev + 1);
  };
  
  const handleRestCantidad = () => {
    if (cantidad > 1) setCantidad(prev => prev - 1);
  };

  return (
    <div className="product-detail-container">
      {/* Navegación Miga de Pan */}
      <div className="breadcrumbs">
        <Link href="/">Inicio</Link> &gt; <Link href={`/?categoria=${producto.categoria_nombre.toLowerCase().replace(/ /g, '-')}`}>{producto.categoria_nombre}</Link> &gt; <span>{producto.sku}</span>
      </div>

      <div className="product-detail-grid">
        {/* Columna Izquierda: Galería */}
        <div className="product-gallery">
          <div className="main-image-box">
            <img src={imagenActiva} alt={producto.nombre} />
          </div>
          
          {producto.imagenes && producto.imagenes.length > 0 && (
            <div className="thumbnail-list">
              {producto.imagenes.map((img: any) => (
                <div 
                  key={img.id_imagen} 
                  className={`thumbnail-box ${imagenActiva === img.url ? 'active' : ''}`}
                  onClick={() => setImagenActiva(img.url)}
                >
                  <img src={img.url} alt="Thumbnail" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Columna Derecha: Información y Compra */}
        <div className="product-info-panel">
          <div className="product-meta">
            <span>SKU: {producto.sku}</span>
            <span>Proveedor: {producto.proveedor_nombre}</span>
          </div>
          
          <h1 className="product-title-large">{producto.nombre}</h1>
          
          <div className="product-price-large">
            <span>Q</span>{parseFloat(producto.precio_unitario).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
          </div>

          <div className={`stock-status ${stockClass}`}>
            {stockText}
          </div>

          <div className="purchase-actions">
            <div className="quantity-selector">
              <button className="quantity-btn" onClick={handleRestCantidad} disabled={cantidad <= 1 || producto.stock_actual === 0}>-</button>
              <input type="number" className="quantity-input" value={producto.stock_actual === 0 ? 0 : cantidad} readOnly />
              <button className="quantity-btn" onClick={handleAddCantidad} disabled={cantidad >= producto.stock_actual || producto.stock_actual === 0}>+</button>
            </div>
            
            <button className="btn-large-gold" disabled={producto.stock_actual === 0}>
              Añadir al Carrito de Compras
            </button>
          </div>

          <div className="product-description-section">
            <h3 className="section-title">Descripción General</h3>
            <p className="product-description">{producto.descripcion || 'Este hardware no cuenta con una descripción detallada provista por el fabricante.'}</p>
            
            {Object.keys(especificaciones).length > 0 && (
              <>
                <h3 className="section-title">Ficha Técnica</h3>
                <table className="specs-table">
                  <tbody>
                    {Object.entries(especificaciones).map(([key, value]) => (
                      <tr key={key}>
                        <td>{key}</td>
                        <td>{String(value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
