const { Client } = require('pg');

const client = new Client({
  user: 'proy2',
  host: 'localhost',
  database: 'koregt',
  password: 'secret',
  port: 5432,
});

const categoryImages = {
  'procesadores': 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80',
  'tarjetas-de-video': 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80',
  'motherboards': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  'memorias-ram': 'https://images.unsplash.com/photo-1562976540-b508567f58f4?w=800&q=80',
  'almacenamiento': 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800&q=80',
  'fuentes-de-poder': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80',
  'cases': 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800&q=80',
  'refrigeracion': 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80',
};

const defaultImage = 'https://images.unsplash.com/photo-1550009158-9effb64fda70?w=800&q=80';

async function updateImages() {
  try {
    await client.connect();
    console.log('Conectado a la base de datos.');

    const res = await client.query(`
      SELECT p.id_producto, c.slug 
      FROM productos p
      JOIN categorias c ON p.id_categoria = c.id_categoria
    `);

    const productos = res.rows;
    let count = 0;

    for (const prod of productos) {
      const imageUrl = categoryImages[prod.slug] || defaultImage;
      
      await client.query(`
        UPDATE imagenes_producto 
        SET url = $1 
        WHERE id_producto = $2
      `, [imageUrl, prod.id_producto]);

      count++;
    }

    console.log(`¡Éxito! Se actualizaron las imágenes de ${count} productos con URLs fotorealistas.`);
  } catch (error) {
    console.error('Error actualizando imágenes:', error);
  } finally {
    await client.end();
  }
}

updateImages();
