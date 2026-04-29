-- Índices para optimizar las consultas en KoreGT

-- Catálogo de productos: Búsquedas frecuentes por categoría y por proveedor
CREATE INDEX idx_productos_categoria ON productos(id_categoria);
CREATE INDEX idx_productos_proveedor ON productos(id_proveedor);

-- Alertas de inventario: Búsqueda de productos con bajo stock
CREATE INDEX idx_productos_stock_actual ON productos(stock_actual);

-- Rendimiento de Carrito y Órdenes
CREATE INDEX idx_carrito_items_carrito ON carrito_items(id_carrito);
CREATE INDEX idx_orden_items_orden ON orden_items(id_orden);
CREATE INDEX idx_ordenes_usuario ON ordenes(id_usuario);

-- Logística y seguimiento de envíos
CREATE INDEX idx_envios_codigo_seguimiento ON envios(codigo_seguimiento);

-- Seguridad: Validación rápida de sesiones de usuario activas
CREATE INDEX idx_sesiones_token_hash ON sesiones(token_hash);

-- Reportes Administrativos: Historial de inventario
CREATE INDEX idx_movimientos_inventario_producto_fecha ON movimientos_inventario(id_producto, fecha);
