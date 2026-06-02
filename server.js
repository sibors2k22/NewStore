const express = require('express');
const path = require('path');

const app = express();

// Middlewares para procesar datos de formularios y JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (nuestra página web y panel)
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal: Carga la tienda al entrar al link
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Configuración del puerto para Railway
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor activo y corriendo en el puerto ${PORT}`);
});
