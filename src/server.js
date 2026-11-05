require('dotenv').config({ quiet: true });

const path = require('node:path');
const express = require('express');
const cors = require('cors');
const productosRoutes = require('./routes/productosRoutes');

const app = express();
const port = Number(process.env.PORT || 3010);

app.disable('x-powered-by');
app.use(cors());
app.use(express.json());
app.use('/api/productos', productosRoutes);
app.use(express.static(path.join(__dirname, '../public')));

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo debe contener JSON válido.' });
  }
  if (error.status >= 400 && error.status < 500) {
    return res.status(error.status).json({ error: 'No se pudo procesar la solicitud.' });
  }
  console.error('Error al procesar la solicitud:', error.code || error.name);
  return res.status(500).json({ error: 'Error interno del servidor.' });
});

app.listen(port, '127.0.0.1', () => {
  console.log(`Inventario disponible en http://127.0.0.1:${port}/`);
});
