const { Client } = require('pg');

const client = new Client({
  user: 'proy2',
  host: 'localhost',
  database: 'koregt',
  password: 'secret',
  port: 5432,
});

async function fetchImageFromBing(query) {
  try {
    const response = await fetch(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}`);
    const html = await response.text();
    const match = html.match(/murl&quot;:&quot;(.*?)&quot;/);
    if (match && match[1]) {
      return match[1];
    }
  } catch (err) {
    console.error('Error fetching image for', query, err);
  }
  return null;
}

const delay = ms => new Promise(res => setTimeout(res, ms));

async function updateImages() {
  try {
    await client.connect();
    console.log('Conectado a la base de datos.');

    const res = await client.query(`SELECT id_producto, nombre FROM productos`);
    const productos = res.rows;
    let count = 0;

    for (const prod of productos) {
      console.log(`Buscando imagen para: ${prod.nombre}`);
      const imageUrl = await fetchImageFromBing(prod.nombre);
      
      if (imageUrl) {
        await client.query(`
          UPDATE imagenes_producto 
          SET url = $1 
          WHERE id_producto = $2
        `, [imageUrl, prod.id_producto]);
        count++;
        console.log(` - Imagen encontrada: ${imageUrl.substring(0, 50)}...`);
      } else {
        console.log(` - No se encontró imagen`);
      }

      // Pequeño delay para no saturar Bing
      await delay(500);
    }

    console.log(`¡Éxito! Se actualizaron las imágenes de ${count} productos con URLs reales de la web.`);
  } catch (error) {
    console.error('Error actualizando imágenes:', error);
  } finally {
    await client.end();
  }
}

updateImages();
