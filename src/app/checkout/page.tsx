'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';
import './checkout.css';

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    direccion: '',
    ciudad: '',
    nit: 'CF'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successOrder, setSuccessOrder] = useState<any>(null);

  // Evitar render en servidor puro para evitar mismatch de carrito
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    setLoading(true);
    setError('');

    try {
      // Usar nuestro endpoint transaccional del Backend
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: 1, // Para el demo, asumimos usuario 1. (En la vida real viene del Token/Sesión)
          direccion_envio: `${formData.direccion}, ${formData.ciudad}. Facturar a NIT: ${formData.nit}`,
          detalles: cart.map(item => ({
            id_producto: item.id_producto,
            cantidad: item.cantidad
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error procesando la orden');
      }

      // Éxito! Limpiamos el carrito local
      clearCart();
      setSuccessOrder(data);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  // Si la compra fue exitosa
  if (successOrder) {
    return (
      <div className="checkout-container">
        <div className="success-view">
          <div className="success-icon">✓</div>
          <h2>¡Orden Confirmada!</h2>
          <p>Gracias por tu compra en KoreGT. Tu pedido está siendo procesado.</p>
          <div className="order-reference">
            ID de Orden: <strong>{successOrder.id_orden}</strong>
          </div>
          <br/>
          <Link href="/catalogo" className="btn-outline-gold" style={{ border: '2px solid var(--gold-primary)' }}>
            Seguir Comprando
          </Link>
        </div>
      </div>
    );
  }

  // Si el carrito está vacío y no hay orden exitosa
  if (cart.length === 0) {
    return (
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Finalizar <span>Compra</span></h1>
        </div>
        <div className="checkout-form-section" style={{ textAlign: 'center' }}>
          <p>No hay productos en tu carrito para procesar.</p>
          <br/>
          <Link href="/catalogo" className="btn-outline-gold">Ir al Catálogo</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Finalizar <span>Compra</span></h1>
      </div>

      <div className="checkout-content">
        {/* Formulario de Envío */}
        <div className="checkout-form-section">
          <h2>Información de Envío</h2>
          {error && <div style={{ color: '#ef4444', marginBottom: '1rem', padding: '1rem', border: '1px solid #ef4444', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.1)' }}>{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre Completo</label>
                <input type="text" name="nombre" className="form-input" required value={formData.nombre} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input type="email" name="email" className="form-input" required value={formData.email} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Dirección de Entrega</label>
              <input type="text" name="direccion" className="form-input" required value={formData.direccion} onChange={handleChange} placeholder="Calle, Avenida, Zona..." />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Ciudad / Municipio</label>
                <input type="text" name="ciudad" className="form-input" required value={formData.ciudad} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>NIT (Para Facturación)</label>
                <input type="text" name="nit" className="form-input" required value={formData.nit} onChange={handleChange} />
              </div>
            </div>

            {/* Simulated Payment Area */}
            <h2 style={{ marginTop: '2rem' }}>Método de Pago</h2>
            <div className="form-group" style={{ opacity: 0.7 }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Esta es una transacción de demostración. El pago será "Efectivo contra entrega" (COD).</p>
              <input type="text" className="form-input" disabled value="💳 Pago Seguro KoreGT Pay (Simulado)" />
            </div>

            <button type="submit" className="btn-submit-order" disabled={loading}>
              {loading ? 'Procesando Transacción...' : 'Confirmar Orden y Pagar'}
            </button>
          </form>
        </div>

        {/* Resumen Lateral */}
        <aside className="checkout-summary">
          <h2>Tu Pedido</h2>
          
          <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.5rem' }}>
            {cart.map(item => (
              <div key={item.id_producto} className="checkout-item">
                <div>
                  <div className="checkout-item-title">{item.nombre.length > 30 ? item.nombre.substring(0, 30) + '...' : item.nombre}</div>
                  <div className="checkout-item-qty">Cant: {item.cantidad}</div>
                </div>
                <div className="checkout-item-price">
                  Q{(item.precio_unitario * item.cantidad).toLocaleString('es-GT', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>Q{totalPrice.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="summary-row">
              <span>Costo de Envío</span>
              <span>Gratis</span>
            </div>
            <div className="summary-row total">
              <span>Total a Pagar</span>
              <span>Q{totalPrice.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
