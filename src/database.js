const { Pool } = require('pg');

     const pool = new Pool({
       user: 'postgres',
       host: 'localhost',
       database: 'bosseyes_db',
       password: '230814',
       port: 5432,
     });

     (async () => {
       try {
         await pool.query(`
           CREATE TABLE IF NOT EXISTS productos (
             id SERIAL PRIMARY KEY,
             referencia VARCHAR(100) NOT NULL UNIQUE,
             imagen_url VARCHAR(255),
             creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
           )
         `);
         await pool.query(`
           CREATE TABLE IF NOT EXISTS combinaciones (
             id SERIAL PRIMARY KEY,
             producto_id INTEGER REFERENCES productos(id),
             color VARCHAR(50) NOT NULL,
             talla VARCHAR(2) NOT NULL CHECK(talla IN ('34', '35', '36', '37', '38', '39', '40', '41')),
             codigo_barras VARCHAR(100) NOT NULL UNIQUE,
             cantidad_inventario INTEGER NOT NULL DEFAULT 0,
             precio DECIMAL(10,2),
             creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
             CONSTRAINT unique_combination UNIQUE (producto_id, color, talla)
           )
         `);
         await pool.query(`
           CREATE TABLE IF NOT EXISTS usuarios (
             id SERIAL PRIMARY KEY,
             nombre VARCHAR(100) NOT NULL,
             email VARCHAR(100) NOT NULL UNIQUE,
             password VARCHAR(255) NOT NULL,
             rol VARCHAR(20) NOT NULL CHECK(rol IN ('admin', 'operador')),
             creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
           )
         `);
         await pool.query(`
           CREATE TABLE IF NOT EXISTS movimientos (
             id SERIAL PRIMARY KEY,
             combinacion_id INTEGER REFERENCES combinaciones(id),
             tipo VARCHAR(20) NOT NULL CHECK(tipo IN ('entrada', 'salida')),
             cantidad INTEGER NOT NULL,
             fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
             usuario_id INTEGER REFERENCES usuarios(id)
           )
         `);
         console.log('Tablas creadas en PostgreSQL');
       } catch (err) {
         console.error('Error al crear tablas:', err.message);
       }
     })();

     module.exports = pool;