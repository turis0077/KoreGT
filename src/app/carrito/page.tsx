'use client';

import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import './carrito.css';

export default function CarritoPage() {
  const { cart, removeFromCart, updateQuantity, totalItems, totalPrice } = useCart();

  if (cart.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-header">
          <h1>Tu Carrito de <span>Compras</span></h1>
        </div>
        <div className="empty-cart">
          <h2>Tu carrito está vacío</h2>
          <p>Aún no has agregado hardware a tu carrito. Explora nuestro catálogo premium.</p>
          <Link href="/" className="btn-outline-gold">
            Explorar Catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Tu Carrito de <span>Compras</span></h1>
      </div>

      <div className="cart-content">
        {/* Lista de Productos */}
        <div className="cart-items-section">
          {cart.map((item) => (
            <div key={item.id_producto} className="cart-item">
              <div className="cart-item-image">
                <img src={item.imagen_principal || ''} alt={item.nombre} />
              </div>
              
              <div className="cart-item-info">
                <span className="cart-item-sku">SKU: {item.sku}</span>
                <Link href={`/producto/${item.id_producto}`} className="cart-item-title">
                  {item.nombre}
                </Link>
                
                <div className="cart-item-controls">
                  <div className="cart-quantity-selector">
                    <button 
                      onClick={() => updateQuantity(item.id_producto, item.cantidad - 1)}
                      disabled={item.cantidad <= 1}
                    >-</button>
                    <input type="number" value={item.cantidad} readOnly />
                    <button 
                      onClick={() => updateQuantity(item.id_producto, item.cantidad + 1)}
                      disabled={item.cantidad >= item.stock_actual}
                    >+</button>
                  </div>
                  
                  <div className="cart-item-price">
                    Q{(item.precio_unitario * item.cantidad).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <button 
                className="btn-remove" 
                onClick={() => removeFromCart(item.id_producto)}
                title="Eliminar producto"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Resumen de Orden */}
        <aside className="cart-summary">
          <h2>Resumen de Orden</h2>
          
          <div className="summary-row">
            <span>Subtotal ({totalItems} items)</span>
            <span>Q{totalPrice.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="summary-row">
            <span>Envío Standard</span>
            <span>Gratis</span>
          </div>
          
          <div className="summary-row total">
            <span>Total</span>
            <span>Q{totalPrice.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* En el próximo commit conectaremos esto al checkout real */}
          <Link href="/checkout" style={{ display: 'block' }}>
            <button className="btn-checkout">
              Proceder al Pago
            </button>
          </Link>
        </aside>
      </div>
    </div>
  );
}
