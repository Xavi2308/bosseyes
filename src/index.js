const express = require('express');
     const cors = require('cors');
     const pool = require('./database');

     const app = express();
     app.use(cors());
     app.use(express.json());

     // Listar productos
     app.get('/api/productos', async (req, res) => {
       try {
         const { rows } = await pool.query('SELECT * FROM productos');
         res.json(rows);
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     // Agregar producto
     app.post('/api/productos', async (req, res) => {
       const { referencia, imagen_url } = req.body;
       if (!referencia) return res.status(400).json({ error: 'Referencia requerida' });
       try {
         const { rows } = await pool.query(
           'INSERT INTO productos (referencia, imagen_url) VALUES ($1, $2) RETURNING id',
           [referencia, imagen_url]
         );
         res.json({ id: rows[0].id });
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     // Listar combinaciones
     app.get('/api/combinaciones', async (req, res) => {
       try {
         const { rows } = await pool.query(
           `SELECT c.*, p.referencia 
            FROM combinaciones c 
            JOIN productos p ON c.producto_id = p.id`
         );
         res.json(rows);
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     // Agregar combinación
     app.post('/api/combinaciones', async (req, res) => {
       const { producto_id, color, talla, cantidad_inventario, precio } = req.body;
       if (!producto_id || !color || !talla || cantidad_inventario < 0) {
         return res.status(400).json({ error: 'Datos inválidos' });
       }
       try {
         const { rows: producto } = await pool.query(
           'SELECT referencia FROM productos WHERE id = $1',
           [producto_id]
         );
         if (!producto[0]) return res.status(400).json({ error: 'Producto no encontrado' });
         const referencia = producto[0].referencia.replace(/\s+/g, '');
         const codigo_barras = `${referencia}-${color}-${talla}`;
         const { rows } = await pool.query(
           `INSERT INTO combinaciones (producto_id, color, talla, codigo_barras, cantidad_inventario, precio) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, codigo_barras`,
           [producto_id, color, talla, codigo_barras, cantidad_inventario, precio]
         );
         res.json({ id: rows[0].id, codigo_barras: rows[0].codigo_barras });
       } catch (err) {
         res.status(500).json({ error: err.message });
       }
     });

     const PORT = 3000;
     app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));