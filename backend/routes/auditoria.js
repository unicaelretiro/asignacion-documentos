const express = require('express');
const router = express.Router();
const db = require('../db');


router.get('/', async (req, res) => {
  const { es_admin } = req.query;

  // Verificar si es admin (acepta true, 'true', 't', 1, '1')
  const isAdmin = es_admin === true || 
                  es_admin === 'true' || 
                  es_admin === 't' || 
                  es_admin === 1 || 
                  es_admin === '1';

  if (!isAdmin) {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere permisos de administrador.' });
  }

  try {
    const result = await db.query(`
      SELECT
        a.id_auditoria,
        a.accion,
        a.tipo_documento,
        a.numero,
        a.asignado_a,
        u.nombre AS asignado_por,
        a.fecha
      FROM auditoria_documentos a
      LEFT JOIN usuarios u
        ON u.id_usuario = a.asignado_por
      ORDER BY a.fecha DESC
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
