'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import './checkout.css';

const PAYPAL_CLIENT_ID = "AY_YEf9N3UwQlig1xliJOxcEXZZ-ICqTWDu-yoqH7qS9-M-_8GbSZkmnUO1HhqscIEBPbCdFJK2SQDl8";
const TASA_CAMBIO = 7.80; // Q7.80 = $1 USD

export default function CheckoutPage() {
  const { cart, totalPrice, clearCart } = useCart();
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    direccion: '',
    ciudad: '',
    nit: 'CF'
  });

  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'paypal'>('efectivo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successOrder, setSuccessOrder] = useState<any>(null);

  // Evitar render en servidor puro para evitar mismatch de carrito
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const processOrderToBackend = async (detallesPago: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_usuario: 1, 
          direccion_envio: `${formData.direccion}, ${formData.ciudad}. Facturar a NIT: ${formData.nit}. Método: ${detallesPago}`,
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

      clearCart();
      setSuccessOrder(data);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    // Si es PayPal, no se procesa acá. Se procesa en el onApprove de PayPalButtons.
    if (metodoPago === 'paypal') return;

    await processOrderToBackend('Efectivo contra entrega');
  };

  if (!mounted) return null;

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
          <Link href="/" className="btn-outline-gold" style={{ border: '2px solid var(--gold-primary)' }}>
            Seguir Comprando
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Finalizar <span>Compra</span></h1>
        </div>
        <div className="checkout-form-section" style={{ textAlign: 'center' }}>
          <p>No hay productos en tu carrito para procesar.</p>
          <br/>
          <Link href="/" className="btn-outline-gold">Ir al Catálogo</Link>
        </div>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
      <div className="checkout-container">
        <div className="checkout-header">
          <h1>Finalizar <span>Compra</span></h1>
        </div>

        <div className="checkout-content">
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

              <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Método de Pago</h2>
              
              <div className="payment-options" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem', border: metodoPago === 'efectivo' ? '2px solid var(--gold-primary)' : '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', background: metodoPago === 'efectivo' ? 'var(--bg-secondary)' : 'transparent' }}>
                  <input 
                    type="radio" 
                    name="metodoPago" 
                    value="efectivo" 
                    checked={metodoPago === 'efectivo'} 
                    onChange={() => setMetodoPago('efectivo')} 
                    style={{ accentColor: 'var(--gold-primary)', width: '20px', height: '20px' }}
                  />
                  <span>💵 Pago en Efectivo contra Entrega</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem', border: metodoPago === 'paypal' ? '2px solid var(--gold-primary)' : '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', background: metodoPago === 'paypal' ? 'var(--bg-secondary)' : 'transparent' }}>
                  <input 
                    type="radio" 
                    name="metodoPago" 
                    value="paypal" 
                    checked={metodoPago === 'paypal'} 
                    onChange={() => setMetodoPago('paypal')} 
                    style={{ accentColor: 'var(--gold-primary)', width: '20px', height: '20px' }}
                  />
                  <span>💳 Pago Seguro con PayPal / Tarjeta de Crédito</span>
                </label>
              </div>

              {metodoPago === 'efectivo' ? (
                <button type="submit" className="btn-submit-order" disabled={loading}>
                  {loading ? 'Procesando Transacción...' : 'Confirmar Orden'}
                </button>
              ) : (
                <div style={{ marginTop: '1rem' }}>
                  {(!formData.nombre || !formData.email || !formData.direccion || !formData.ciudad) ? (
                    <div style={{ padding: '1rem', border: '1px solid var(--gold-secondary)', borderRadius: '8px', color: 'var(--gold-primary)', textAlign: 'center' }}>
                      Por favor, completa tu información de envío arriba para habilitar el pago con PayPal.
                    </div>
                  ) : (
                    <PayPalButtons 
                      style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay" }}
                      createOrder={(data, actions) => {
                        const usdAmount = (totalPrice / TASA_CAMBIO).toFixed(2);
                        return actions.order.create({
                          intent: "CAPTURE",
                          purchase_units: [
                            {
                              description: "KoreGT Hardware",
                              amount: {
                                currency_code: "USD",
                                value: usdAmount
                              }
                            }
                          ]
                        });
                      }}
                      onApprove={async (data, actions) => {
                        if (actions.order) {
                          const details = await actions.order.capture();
                          await processOrderToBackend(`PayPal ID: ${details.id}`);
                        }
                      }}
                      onError={(err) => {
                        console.error("PayPal Error:", err);
                        setError("Ocurrió un error al intentar comunicar con PayPal. Intenta de nuevo.");
                      }}
                    />
                  )}
                </div>
              )}
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
                <div style={{ textAlign: 'right' }}>
                  <div>Q{totalPrice.toLocaleString('es-GT', { minimumFractionDigits: 2 })}</div>
                  {metodoPago === 'paypal' && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      ≈ ${(totalPrice / TASA_CAMBIO).toFixed(2)} USD
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
