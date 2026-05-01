'use client';

import { useState, useEffect } from 'react';
import './admin.css';

export default function AdminPage() {
  const [tab, setTab] = useState('reportes');

  // Datos
  const [reportes, setReportes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);

  // Estados de carga
  const [loading, setLoading] = useState(true);

  const fetchDatos = async () => {
    setLoading(true);
    try {
      const [resR, resC, resP] = await Promise.all([
        fetch('/api/admin/reportes'),
        fetch('/api/categorias'),
        fetch('/api/productos')
      ]);
      setReportes(await resR.json());
      setCategorias(await resC.json());
      setProductos(await resP.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  // Handlers CRUD Categorias
  const handleCrearCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    await fetch('/api/admin/categorias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    fetchDatos();
  };

  const handleBorrarCategoria = async (id: number) => {
    if (!confirm('¿Borrar categoría?')) return;
    const res = await fetch('/api/admin/categorias', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_categoria: id }),
    });
    const data = await res.json();
    if (data.error) alert(data.error);
    fetchDatos();
  };

  // Handlers CRUD Productos
  const handleCrearProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    await fetch('/api/admin/productos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    fetchDatos();
  };

  const handleBorrarProducto = async (id: number) => {
    if (!confirm('¿Borrar producto?')) return;
    await fetch('/api/admin/productos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_producto: id }),
    });
    fetchDatos();
  };

  if (loading) return <div className="admin-loader">Cargando Sistema de Administración...</div>;

  return (
    <div className="admin-container">
      <h1 className="admin-title">Panel de Control <span>KoreGT</span></h1>
      
      <div className="admin-tabs">
        <button className={tab === 'reportes' ? 'active' : ''} onClick={() => setTab('reportes')}>📊 Reportes (SQL Avanzado)</button>
        <button className={tab === 'categorias' ? 'active' : ''} onClick={() => setTab('categorias')}>📁 Categorías (CRUD)</button>
        <button className={tab === 'productos' ? 'active' : ''} onClick={() => setTab('productos')}>💻 Productos (CRUD)</button>
      </div>

      <div className="admin-content">
        {tab === 'reportes' && (
          <div>
            <h2>Reporte Gerencial de Ventas</h2>
            <p>Este reporte se genera usando una VISTA en PostgreSQL cruzada con un Expresión de Tabla Común (WITH), filtrada por GROUP BY y HAVING.</p>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Ingreso x Categoría</th>
                  <th>Total Vendido</th>
                  <th>Ingresos Totales (Q)</th>
                </tr>
              </thead>
              <tbody>
                {reportes.length === 0 ? (
                  <tr><td colSpan={6} style={{textAlign:'center'}}>Aún no hay compras procesadas.</td></tr>
                ) : (
                  reportes.map((r: any, idx) => (
                    <tr key={idx}>
                      <td>{r.sku}</td>
                      <td>{r.producto}</td>
                      <td>{r.categoria}</td>
                      <td>Q{Number(r.ingresos_categoria).toLocaleString('es-GT')}</td>
                      <td>{r.total_unidades_vendidas} unds.</td>
                      <td style={{color:'var(--gold-primary)', fontWeight:'bold'}}>Q{Number(r.ingresos_totales).toLocaleString('es-GT')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'categorias' && (
          <div>
            <h2>Gestión de Categorías</h2>
            <form className="admin-form" onSubmit={handleCrearCategoria}>
              <input name="nombre" placeholder="Nombre (Ej. Monitores)" required />
              <input name="slug" placeholder="Slug (Ej. monitores)" required />
              <input name="descripcion" placeholder="Descripción" />
              <button type="submit">Agregar Categoría</button>
            </form>
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Nombre</th><th>Slug</th><th>Acciones</th></tr></thead>
              <tbody>
                {categorias.map((c: any) => (
                  <tr key={c.id_categoria}>
                    <td>{c.id_categoria}</td>
                    <td>{c.nombre}</td>
                    <td>{c.slug}</td>
                    <td>
                      <button className="btn-delete" onClick={() => handleBorrarCategoria(c.id_categoria)}>🗑️ Borrar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'productos' && (
          <div>
            <h2>Gestión de Productos</h2>
            <form className="admin-form" onSubmit={handleCrearProducto}>
              <input name="nombre" placeholder="Nombre del Producto" required />
              <input name="precio_unitario" type="number" step="0.01" placeholder="Precio (Q)" required />
              <input name="stock_actual" type="number" placeholder="Stock" required />
              <select name="id_categoria" required>
                {categorias.map((c: any) => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
              </select>
              <button type="submit">Agregar Producto</button>
            </form>
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead>
              <tbody>
                {productos.map((p: any) => (
                  <tr key={p.id_producto}>
                    <td>{p.id_producto}</td>
                    <td>{p.nombre}</td>
                    <td>Q{Number(p.precio_unitario).toLocaleString('es-GT')}</td>
                    <td>{p.stock_actual}</td>
                    <td>
                      <button className="btn-delete" onClick={() => handleBorrarProducto(p.id_producto)}>🗑️ Borrar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
