const express = require('express');
const router = express.Router();
const db = require('../db');

function esAdminValor(v) {
  return (
    v === true ||
    v === 'true' ||
    v === 't' ||
    v === 1 ||
    v === '1'
  );
}

async function verificarAdmin(req, res) {
  const body = req.body || {};
  const query = req.query || {};
  const es_admin = body.es_admin !== undefined ? body.es_admin : query.es_admin;
  const id_usuario = body.id_usuario !== undefined ? body.id_usuario : query.id_usuario;

  if (esAdminValor(es_admin)) {
    return true;
  }

  if (id_usuario) {
    const userCheck = await db.query('SELECT es_admin FROM usuarios WHERE id_usuario = $1', [
      id_usuario
    ]);
    if (userCheck.rows.length === 0) {
      res.status(403).json({ error: 'Acceso denegado. Usuario no encontrado.' });
      return false;
    }
    const userEsAdmin = userCheck.rows[0].es_admin;
    if (esAdminValor(userEsAdmin)) {
      return true;
    }
  }

  res.status(403).json({ error: 'Acceso denegado. Se requiere permisos de administrador.' });
  return false;
}

// Listar tipos con último número configurado (y máximo en documentos si aplica)
router.get('/', async (req, res) => {
  if (!(await verificarAdmin(req, res))) return;

  try {
    const result = await db.query(`
      SELECT
        t.id_tipo_documento,
        t.nombre,
        COALESCE(n.ultimo_numero, 0)::bigint AS ultimo_numero,
        (
          SELECT MAX(CAST(TRIM(d.numero::text) AS BIGINT))
          FROM documentos d
          WHERE d.id_tipo_documento = t.id_tipo_documento
            AND TRIM(d.numero::text) ~ '^[0-9]+$'
        ) AS max_numero_en_documentos
      FROM tipos_documento t
      LEFT JOIN numeracion_tipo_documento n ON n.id_tipo_documento = t.id_tipo_documento
      ORDER BY t.nombre
    `);
    res.json(result.rows);
  } catch (error) {
    if (error.message && error.message.includes('numeracion_tipo_documento')) {
      return res.status(500).json({
        error:
          'Falta la tabla numeracion_tipo_documento. Ejecute database/numeracion_tipo_documento.sql en PostgreSQL.'
      });
    }
    res.status(500).json({ error: error.message });
  }
});

// Fijar último número asignado para un tipo (el siguiente documento será ese + 1)
router.put('/:id_tipo', async (req, res) => {
  if (!(await verificarAdmin(req, res))) return;

  try {
    const idTipo = parseInt(req.params.id_tipo, 10);
    if (Number.isNaN(idTipo)) {
      return res.status(400).json({ error: 'id_tipo inválido' });
    }

    const { ultimo_numero } = req.body;
    if (ultimo_numero === undefined || ultimo_numero === null || String(ultimo_numero).trim() === '') {
      return res.status(400).json({ error: 'ultimo_numero es requerido' });
    }

    const ultimo = parseInt(String(ultimo_numero), 10);
    if (Number.isNaN(ultimo) || ultimo < 0) {
      return res.status(400).json({ error: 'ultimo_numero debe ser un entero mayor o igual a 0' });
    }

    const existe = await db.query('SELECT 1 FROM tipos_documento WHERE id_tipo_documento = $1', [idTipo]);
    if (existe.rows.length === 0) {
      return res.status(404).json({ error: 'Tipo de documento no encontrado' });
    }

    await db.query(
      `
      INSERT INTO numeracion_tipo_documento (id_tipo_documento, ultimo_numero)
      VALUES ($1, $2)
      ON CONFLICT (id_tipo_documento) DO UPDATE SET ultimo_numero = EXCLUDED.ultimo_numero
    `,
      [idTipo, ultimo]
    );

    res.json({
      message: 'Parámetro guardado',
      id_tipo_documento: idTipo,
      ultimo_numero: ultimo
    });
  } catch (error) {
    if (error.message && error.message.includes('numeracion_tipo_documento')) {
      return res.status(500).json({
        error:
          'Falta la tabla numeracion_tipo_documento. Ejecute database/numeracion_tipo_documento.sql en PostgreSQL.'
      });
    }
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
