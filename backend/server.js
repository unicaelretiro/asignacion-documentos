require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Permitir tu frontend de Vercel (y localhost para desarrollo)
const corsOptions = {
  origin: [
    'http://localhost:5500',        // Live Server local
    'http://127.0.0.1:5500',
    'https://asignacion-documentos.vercel.app/dashboard.html'     // ← reemplaza con tu URL de Vercel
  ],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/documentos', require('./routes/documentos'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/auditoria', require('./routes/auditoria'));
app.use('/api/parametrizacion', require('./routes/parametrizacion'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});