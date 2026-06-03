const express = require('express');
const router = express.Router();
const pool = require('../db');

// RUTA: Obtener el catálogo completo con sus variantes y stock
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.id, p.nombre, p.descripcion, p.categoria, p.activo,
                   json_agg(
                       json_build_object(
                           'id', v.id,
                           'atributos', v.atributos,
                           'precio', v.precio,
                           'stock', v.stock
                       )
                   ) as variantes
            FROM productos p
            LEFT JOIN variantes_producto v ON p.id = v.producto_id
            GROUP BY p.id
            ORDER BY p.id DESC;
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("Error al obtener productos:", err);
        res.status(500).json({ error: 'Error del servidor al obtener catálogo' });
    }
});

// RUTA: Registrar un nuevo producto desde el panel
router.post('/', async (req, res) => {
    // Recibimos los datos del formulario
    const { nombre, descripcion, precio, stock, atributos } = req.body;
    
    try {
        // Iniciamos una transacción (Si algo falla, no se guarda nada a medias)
        await pool.query('BEGIN'); 
        
        // 1. Insertamos el producto padre y obtenemos su ID generado
        const prodResult = await pool.query(
            'INSERT INTO productos (nombre, descripcion) VALUES ($1, $2) RETURNING id',
            [nombre, descripcion]
        );
        const productoId = prodResult.rows[0].id;
        
        // 2. Insertamos la configuración de precio y stock como su primera variante
        await pool.query(
            'INSERT INTO variantes_producto (producto_id, precio, stock, atributos) VALUES ($1, $2, $3, $4)',
            [productoId, precio, stock, atributos || '{}']
        );
        
        // Confirmamos la transacción
        await pool.query('COMMIT');
        res.json({ success: true, message: 'Producto registrado correctamente' });
    } catch (err) {
        // Si hay error, revertimos cualquier cambio
        await pool.query('ROLLBACK');
        console.error("Error al registrar producto:", err);
        res.status(500).json({ error: 'Error al registrar el producto' });
    }
});

module.exports = router;
