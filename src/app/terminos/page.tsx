import '../static.css';

export default function TerminosPage() {
  return (
    <div className="static-container">
      <div className="static-header">
        <h1>Términos y <span>Condiciones</span></h1>
        <p>Políticas de uso de nuestra plataforma</p>
      </div>
      <div className="static-content glass-panel">
        <h2>1. Aceptación de los Términos</h2>
        <p>Al acceder y utilizar KoreGT Premium Tech Store, aceptas cumplir con estos términos y condiciones en su totalidad. Si no estás de acuerdo, te pedimos que no utilices nuestros servicios.</p>
        
        <h2>2. Productos y Garantías</h2>
        <p>Todos nuestros productos de hardware son originales y premium. La garantía de cada producto es proporcionada directamente por el fabricante bajo sus términos específicos.</p>
        
        <h2>3. Política de Precios</h2>
        <p>Los precios están sujetos a cambios sin previo aviso. Nos reservamos el derecho de cancelar órdenes si detectamos errores evidentes en el precio listado.</p>
        
        <h2>4. Devoluciones</h2>
        <p>Aceptamos devoluciones dentro de los primeros 15 días posteriores a la compra, siempre que el producto esté sellado y en su empaque original.</p>
      </div>
    </div>
  );
}
