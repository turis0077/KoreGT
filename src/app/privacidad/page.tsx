import '../static.css';

export default function PrivacidadPage() {
  return (
    <div className="static-container">
      <div className="static-header">
        <h1>Política de <span>Privacidad</span></h1>
        <p>Cómo protegemos tus datos</p>
      </div>
      <div className="static-content glass-panel">
        <h2>1. Recopilación de Información</h2>
        <p>Recopilamos la información necesaria para procesar tus pedidos de hardware, incluyendo nombre, dirección de envío y correo electrónico. No almacenamos datos de tarjetas de crédito.</p>
        
        <h2>2. Uso de la Información</h2>
        <p>Tu información se utiliza exclusivamente para:
          <ul>
            <li>Procesar y enviar tus pedidos.</li>
            <li>Enviarte actualizaciones sobre tu compra.</li>
            <li>Responder a tus consultas de soporte técnico.</li>
          </ul>
        </p>
        
        <h2>3. Protección de Datos</h2>
        <p>Implementamos medidas de seguridad premium para proteger tu información personal contra acceso no autorizado. Nuestro sitio utiliza cifrado de extremo a extremo para las transacciones.</p>
        
        <h2>4. Cookies</h2>
        <p>Utilizamos cookies para mejorar la experiencia de usuario, mantener tu sesión activa y guardar los artículos en tu carrito de compras.</p>
      </div>
    </div>
  );
}
