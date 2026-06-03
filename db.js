const { Pool } = require('pg');

// Configuración del pool de conexiones optimizado usando la variable de Railway
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Requerido para conexiones seguras en la nube de Railway
    }
});

// Script automático para estructurar las tablas de NewStore sin procesos manuales
const initDB = async () => {
    const queryText = `
        CREATE TABLE IF NOT EXISTS usuarios_admin (
            id SERIAL PRIMARY KEY,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS productos (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR(150) NOT NULL,
            descripcion TEXT,
            categoria VARCHAR(100),
            activo BOOLEAN DEFAULT TRUE
        );

        CREATE TABLE IF NOT EXISTS variantes_producto (
            id SERIAL PRIMARY KEY,
            producto_id INT REFERENCES productos(id) ON DELETE CASCADE,
            atributos JSONB DEFAULT '{}',
            precio NUMERIC(10, 2) NOT NULL,
            stock INT NOT NULL DEFAULT 0,
            sku VARCHAR(50)
        );

        CREATE TABLE IF NOT EXISTS ordenes (
            id SERIAL PRIMARY KEY,
            cliente_nombre VARCHAR(150) NOT NULL,
            whatsapp VARCHAR(20) NOT NULL,
            direccion TEXT NOT NULL,
            ubicacion_url TEXT,
            referencias TEXT,
            notas TEXT,
            metodo_pago VARCHAR(50) NOT NULL,
            comprobante_url TEXT,
            estado VARCHAR(50) DEFAULT 'Pendiente',
            total NUMERIC(10, 2) NOT NULL,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS detalles_orden (
            id SERIAL PRIMARY KEY,
            orden_id INT REFERENCES ordenes(id) ON DELETE CASCADE,
            variante_id INT REFERENCES variantes_producto(id) ON DELETE SET NULL,
            cantidad INT NOT NULL,
            precio_unitario NUMERIC(10, 2) NOT NULL
        );
    `;

    try {
        await pool.query(queryText);
        console.log("Base de datos conectada y tablas inicializadas con éxito.");
    } catch (err) {
        console.error("Error al inicializar la base de datos:", err);
    }
};

initDB();

module.exports = pool;
