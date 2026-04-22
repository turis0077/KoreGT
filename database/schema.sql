-- DDL para KoreGT

-- Roles de usuario (en lugar de ENUM)
CREATE TABLE roles_usuario (
    id_rol SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT
);

-- Usuarios
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(150) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    id_rol INTEGER NOT NULL REFERENCES roles_usuario(id_rol),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    creado_por INTEGER REFERENCES usuarios(id_usuario)
);

-- Sesiones
CREATE TABLE sesiones (
    id_sesion SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    ip VARCHAR(45),
    user_agent TEXT,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expira_en TIMESTAMP NOT NULL,
    activa BOOLEAN NOT NULL DEFAULT TRUE
);

-- Direcciones
CREATE TABLE direcciones (
    id_direccion SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    alias VARCHAR(50) NOT NULL,
    departamento VARCHAR(100) NOT NULL,
    municipio VARCHAR(100) NOT NULL,
    zona VARCHAR(20),
    direccion_linea1 TEXT NOT NULL,
    direccion_linea2 TEXT,
    referencia TEXT,
    es_predeterminada BOOLEAN NOT NULL DEFAULT FALSE
);

-- Proveedores
CREATE TABLE proveedores (
    id_proveedor SERIAL PRIMARY KEY,
    nombre VARCHAR(150) UNIQUE NOT NULL,
    contacto_nombre VARCHAR(150),
    contacto_correo VARCHAR(150),
    contacto_telefono VARCHAR(20),
    pais VARCHAR(100)
);

-- Categorías
CREATE TABLE categorias (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    id_categoria_padre INTEGER REFERENCES categorias(id_categoria)
);

-- Secuencia para el SKU de productos
CREATE SEQUENCE seq_sku START 200 INCREMENT 1;

-- Productos
CREATE TABLE productos (
    id_producto SERIAL PRIMARY KEY,
    sku VARCHAR(6) UNIQUE NOT NULL DEFAULT LPAD(nextval('seq_sku')::TEXT, 6, '0'),
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    especificaciones JSONB,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    stock_actual INTEGER NOT NULL DEFAULT 0,
    stock_minimo INTEGER NOT NULL DEFAULT 0,
    stock_maximo INTEGER NOT NULL,
    id_categoria INTEGER NOT NULL REFERENCES categorias(id_categoria),
    id_proveedor INTEGER NOT NULL REFERENCES proveedores(id_proveedor),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_stock_minimo CHECK (stock_minimo >= 0),
    CONSTRAINT chk_stock_maximo CHECK (stock_maximo >= stock_minimo),
    CONSTRAINT chk_stock_actual CHECK (stock_actual >= 0)
);

-- Imágenes Producto
CREATE TABLE imagenes_producto (
    id_imagen SERIAL PRIMARY KEY,
    id_producto INTEGER NOT NULL REFERENCES productos(id_producto),
    url TEXT NOT NULL,
    orden INTEGER NOT NULL DEFAULT 0,
    es_principal BOOLEAN NOT NULL DEFAULT FALSE
);

-- Métodos Envío
CREATE TABLE metodos_envio (
    id_envio_metodo SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    costo DECIMAL(10, 2) NOT NULL,
    dias_minimo INTEGER NOT NULL,
    dias_maximo INTEGER NOT NULL,
    descripcion TEXT
);

-- Métodos Pago
CREATE TABLE metodos_pago (
    id_pago_metodo SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    descripcion TEXT
);

-- Carritos
CREATE TABLE carritos (
    id_carrito SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario) UNIQUE,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Carrito Items
CREATE TABLE carrito_items (
    id_carrito_item SERIAL PRIMARY KEY,
    id_carrito INTEGER NOT NULL REFERENCES carritos(id_carrito),
    id_producto INTEGER NOT NULL REFERENCES productos(id_producto),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario_snapshot DECIMAL(10, 2) NOT NULL
);

-- Cotizaciones
CREATE TABLE cotizaciones (
    id_cotizacion SERIAL PRIMARY KEY,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    fecha_generacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'pendiente'
);

-- Cotizaciones Items
CREATE TABLE cotizacion_items (
    id_cotizacion_item SERIAL PRIMARY KEY,
    id_cotizacion INTEGER NOT NULL REFERENCES cotizaciones(id_cotizacion),
    id_producto INTEGER NOT NULL REFERENCES productos(id_producto),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario_snapshot DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

-- Órdenes
CREATE TABLE ordenes (
    id_orden SERIAL PRIMARY KEY,
    codigo_orden VARCHAR(50) UNIQUE NOT NULL,
    id_usuario INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    id_direccion INTEGER NOT NULL REFERENCES direcciones(id_direccion),
    direccion_snapshot TEXT NOT NULL,
    id_envio_metodo INTEGER NOT NULL REFERENCES metodos_envio(id_envio_metodo),
    id_pago_metodo INTEGER NOT NULL REFERENCES metodos_pago(id_pago_metodo),
    estado VARCHAR(50) NOT NULL DEFAULT 'creada',
    subtotal DECIMAL(10, 2) NOT NULL,
    costo_envio DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    fecha_orden TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notas TEXT
);

-- Ordenes Items
CREATE TABLE orden_items (
    id_orden_item SERIAL PRIMARY KEY,
    id_orden INTEGER NOT NULL REFERENCES ordenes(id_orden),
    id_producto INTEGER NOT NULL REFERENCES productos(id_producto),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario_snapshot DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

-- Secuencia para Envios
CREATE SEQUENCE seq_envio START 1 INCREMENT 1;

-- Envíos
CREATE TABLE envios (
    id_envio SERIAL PRIMARY KEY,
    id_orden INTEGER NOT NULL REFERENCES ordenes(id_orden),
    codigo_seguimiento VARCHAR(9) UNIQUE NOT NULL DEFAULT ('GT-' || LPAD(nextval('seq_envio')::TEXT, 6, '0')),
    estado_envio VARCHAR(50) NOT NULL DEFAULT 'pendiente',
    fecha_despacho TIMESTAMP,
    fecha_entrega_estimada TIMESTAMP,
    fecha_entrega_real TIMESTAMP,
    observaciones TEXT
);

-- Pagos
CREATE TABLE pagos (
    id_pago SERIAL PRIMARY KEY,
    id_orden INTEGER NOT NULL REFERENCES ordenes(id_orden),
    id_pago_metodo INTEGER NOT NULL REFERENCES metodos_pago(id_pago_metodo),
    referencia_externa VARCHAR(255),
    monto DECIMAL(10, 2) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'pendiente',
    fecha_pago TIMESTAMP,
    comprobante_url TEXT
);

-- Movimientos Inventario
CREATE TABLE movimientos_inventario (
    id_movimiento SERIAL PRIMARY KEY,
    id_producto INTEGER NOT NULL REFERENCES productos(id_producto),
    tipo VARCHAR(50) NOT NULL,
    cantidad INTEGER NOT NULL,
    stock_antes INTEGER NOT NULL,
    stock_despues INTEGER NOT NULL,
    referencia TEXT,
    id_usuario_resp INTEGER NOT NULL REFERENCES usuarios(id_usuario),
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- VISTA (VIEW) para Reporte Gerencial de Ventas por Producto
CREATE OR REPLACE VIEW reporte_ventas_productos AS
SELECT 
    p.sku,
    p.nombre AS producto,
    c.nombre AS categoria,
    pr.nombre AS proveedor,
    SUM(oi.cantidad) AS total_unidades_vendidas,
    SUM(oi.subtotal) AS ingresos_totales,
    p.stock_actual
FROM orden_items oi
JOIN productos p ON oi.id_producto = p.id_producto
JOIN categorias c ON p.id_categoria = c.id_categoria
JOIN proveedores pr ON p.id_proveedor = pr.id_proveedor
JOIN ordenes o ON oi.id_orden = o.id_orden
WHERE o.estado != 'cancelada'
GROUP BY p.sku, p.nombre, c.nombre, pr.nombre, p.stock_actual;
