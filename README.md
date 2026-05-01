# KoreGT - E-Commerce de Hardware Premium 💻✨

KoreGT es una plataforma de e-commerce moderna, robusta y optimizada orientada a la venta de hardware de computadora premium en Guatemala. Cuenta con un diseño elegante (cristal / glassmorphism), modo oscuro/claro automático, integración real con la pasarela de pagos de PayPal y una base de datos relacional sólida en PostgreSQL que asegura transacciones ACID para evitar la sobreventa de inventario.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** Next.js 14 (App Router), React, Vanilla CSS (Premium Glassmorphism).
- **Backend:** Next.js Route Handlers (API RESTful integrada).
- **Base de Datos:** PostgreSQL 16 (Desplegada en Docker).
- **Controlador DB:** `pg` (Node-Postgres).
- **Pagos:** `@paypal/react-paypal-js` (PayPal Checkout REST API).
- **Web Scraping:** Scripts en Node.js puro para obtener fotos reales e individuales de cada producto usando Bing Images.

---

## 🚀 Guía de Instalación y Despliegue desde Cero

Sigue estos pasos para levantar el entorno de desarrollo en tu máquina local.

### 1. Requisitos Previos
- Tener instalado **Node.js** (versión 18 o superior).
- Tener instalado **Docker Desktop** (para levantar la base de datos PostgreSQL fácilmente).
- Git (opcional, para clonar el repositorio).

### 2. Clonar el repositorio
```bash
git clone https://github.com/turis0077/KoreGT.git
cd KoreGT
```

### 3. Levantar la Base de Datos (PostgreSQL)
El proyecto incluye un archivo `docker-compose.yml` preconfigurado.
1. Asegúrate de tener Docker Desktop abierto.
2. Abre tu terminal en la raíz del proyecto y ejecuta:
```bash
docker-compose up -d
```
*Esto descargará y levantará un contenedor de PostgreSQL en el puerto `5432` con las credenciales `proy2`/`secret` y creará la base de datos `koregt`.*

### 4. Inicializar y Poblar la Base de Datos (Migraciones)
El proyecto contiene scripts para crear las tablas, poblar los productos y descargar las imágenes reales:
```bash
npm run setup:db
```
*Si tienes problemas con el comando, puedes ejecutarlos individualmente en este orden:*
1. `node scripts/01_schema.js` (Crea las 19 tablas relacionales)
2. `node scripts/02_triggers.js` (Crea funciones de auditoría)
3. `node scripts/03_seed.js` (Puebla la BD con 50 productos, categorías, inventario y proveedores)
4. `node scripts/05_scrape_images.js` (Asigna automáticamente imágenes web a cada producto)

### 5. Instalar Dependencias del Frontend/Backend
```bash
npm install
```

### 6. Levantar el Servidor de Desarrollo
```bash
npm run dev
```
La aplicación estará disponible en **[http://localhost:3000](http://localhost:3000)**.

---

## 💻 ¿Cómo Usar la Página?

1. **Catálogo y Filtrado:**
   - Navega por el catálogo principal (`/`).
   - Usa el **Buscador Superior** para buscar productos por nombre o descripción (ej: "RTX", "Laptop").
   - Usa la **Barra Lateral (Sidebar)** para filtrar por categorías (Laptops, Componentes, Periféricos, etc.).
   - Alterna el tema visual (Modo Oscuro / Claro) usando el botón de la luna/sol en el pie de página o en tu sistema operativo.

2. **Detalles del Producto:**
   - Haz clic en "Ver Detalles" en cualquier producto para ver sus especificaciones completas, disponibilidad real de stock, y reseñas.
   
3. **Carrito de Compras:**
   - Agrega productos al carrito.
   - Accede a tu carrito desde el icono en la barra superior.
   - Modifica las cantidades y observa cómo se actualizan los subtotales automáticamente de manera persistente.

4. **Proceso de Pago Seguro (Checkout) y Transacciones ACID:**
   - En el Checkout, se te pedirán tus datos de envío.
   - Nuestra API implementa bloqueos de fila (`SELECT FOR UPDATE`) para congelar el inventario de la base de datos mientras procesas tu pago, garantizando que nunca se venda un producto agotado.
   - Puedes seleccionar **Pago contra Entrega** o **PayPal**.

---

## 💳 Entorno de Pagos y Tarjeta de Prueba (Sandbox)

El proyecto cuenta con integración completa de **PayPal**. Para propósitos académicos y de evaluación técnica, la pasarela está conectada en **Modo Sandbox** (Desarrollo).

Esto significa que **puedes simular un pago con tarjeta de crédito** sin usar dinero real.

Para probar la pasarela:
1. Agrega artículos al carrito y ve al Checkout.
2. Llena tus datos de envío (Nombre, Correo, Dirección, Ciudad).
3. Selecciona el método **"Pago Seguro con PayPal / Tarjeta de Crédito"**.
4. Haz clic en el botón negro de **Tarjeta de Débito o Crédito** que aparece.
5. Utiliza la siguiente tarjeta de prueba de Guatemala proporcionada por el entorno Sandbox:

| Campo | Valor de Prueba |
| :--- | :--- |
| **Número de Tarjeta** | `4032036265189090` |
| **Vencimiento** | `12/2030` |
| **CVV/CSC** | `052` |
| **Código Postal** | `01001` (u otro de tu preferencia) |

*Si esta tarjeta expiró o deseas generar otra, puedes hacerlo en el [Generador Oficial de PayPal Developer](https://developer.paypal.com/tools/sandbox/card-testing/#link-creditcardgeneratorfortesting).*

Una vez procesado exitosamente el pago por PayPal, la aplicación capturará la orden, descontará el inventario en Postgresql y te mostrará la pantalla de confirmación exitosa de la orden.

---

**¡Disfruta navegando por KoreGT!** 🛒✨
