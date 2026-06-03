const express = require('express');
const path = require('path');
const pool = require('./db'); 

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// --- RUTAS DE LA API ---
// Conectamos el archivo de rutas que acabas de crear
app.use('/api/productos', require('./routes/productos'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor activo y corriendo en el puerto ${PORT}`);
});
