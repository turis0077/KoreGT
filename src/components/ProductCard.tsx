import Link from 'next/link';

export default function ProductCard({ producto }: { producto: any }) {
  // Placeholder elegante si no hay imagen
  const imgUrl = producto.imagen_principal || 'https://via.placeholder.com/400x400?text=KoreGT+Hardware';

  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        {/* Usamos etiqueta img estandar por ahora para simplificar compatibilidad de urls externas */}
        <img src={imgUrl} alt={producto.nombre} className="product-image" loading="lazy" />
        
        {/* Alertas de Stock basadas en reglas de negocio (ACID) */}
        {producto.stock_actual < 5 && producto.stock_actual > 0 && (
          <span className="badge-warning">¡Últimas {producto.stock_actual}!</span>
        )}
        {producto.stock_actual === 0 && (
          <span className="badge-danger">Agotado</span>
        )}
      </div>

      <div className="product-info">
        <span className="product-category">{producto.categoria_nombre}</span>
        <h3 className="product-title" title={producto.nombre}>
          {producto.nombre.length > 55 ? producto.nombre.substring(0, 55) + '...' : producto.nombre}
        </h3>
        
        <p className="product-price">
          <span>Q</span>{parseFloat(producto.precio_unitario).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
        </p>

        <div className="product-actions">
          <Link href={`/producto/${producto.id_producto}`} className="btn-details">
            Ver Detalles
          </Link>
          <button className="btn-gold" disabled={producto.stock_actual === 0}>
            + Carrito
          </button>
        </div>
      </div>
    </div>
  );
}
