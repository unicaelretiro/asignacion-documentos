const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/login', async (req, res) => {
  const { usuario, password } = req.body;

  const result = await db.query(
    `SELECT id_usuario, nombre, password_hash, es_admin
     FROM usuarios
     WHERE usuario = $1 AND activo = true`,
    [usuario]
  );

  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'Usuario no válido' });
  }

  const user = result.rows[0];

  // Comparación simple (como acordamos)
  if (password !== user.password_hash) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }

  res.json({
    id_usuario: user.id_usuario,
    nombre: user.nombre,
    es_admin: user.es_admin
  });
});

module.exports = router;
