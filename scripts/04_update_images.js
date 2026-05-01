const { Client } = require('pg');

const client = new Client({
  user: 'proy2',
  host: 'localhost',
  database: 'koregt',
  password: 'secret',
  port: 5432,
});

const categoryImages = {
  'Procesadores': 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80',
  'Tarjetas de Video': 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&q=80',
  'Tarjetas Madre': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  'Memorias RAM': 'https://images.unsplash.com/photo-1562976540-b508567f58f4?w=800&q=80',
  'Almacenamiento SSD': 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800&q=80',
  'Fuentes de Poder': 'https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&q=80',
  'Case / Chasis': 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800&q=80',
  'Refrigeracion': 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&q=80',
  'Laptops': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
  'Desktops': 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800&q=80',
  'Monitores': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
  'Teclados': 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80',
  'Ratones': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
  'Audifonos': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80',
  'Sillas Gamers': 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800&q=80',
  'Routers': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
};

const defaultImage = 'https://images.unsplash.com/photo-1550009158-9effb64fda70?w=800&q=80';

async function updateImages() {
  try {
    await client.connect();
    console.log('Conectado a la base de datos.');

    const res = await client.query(`
      SELECT p.id_producto, c.nombre 
      FROM productos p
      JOIN categorias c ON p.id_categoria = c.id_categoria
    `);

    const productos = res.rows;
    let count = 0;

    for (const prod of productos) {
      const imageUrl = categoryImages[prod.nombre] || defaultImage;
      
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
