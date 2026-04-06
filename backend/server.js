require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// El header Origin nunca incluye ruta (/login.html): debe ser solo esquema + host (+ puerto).
// En Railway puedes definir ALLOWED_ORIGINS=https://tu-app.vercel.app,https://otra.com
const defaultOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'https://asignacion-documentos.vercel.app'
];
const envOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
  : [];
const allowedList = [...new Set([...defaultOrigins, ...envOrigins])];

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedList.includes(origin)) {
      return callback(null, true);
    }
    if (/^https:\/\/[\w.-]+\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    callback(null, false);
  },
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