const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/asignar', async (req, res) => {
  const { id_tipo_documento, asignado_a, id_usuario } = req.body;

  try {
    const result = await db.query(
      `SELECT * FROM asignar_documento($1, $2, $3)`,
      [id_tipo_documento, asignado_a, id_usuario]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener todos los documentos (opcional: ?id_tipo_documento=N)
router.get('/', async (req, res) => {
  try {
    const rawTipo = req.query.id_tipo_documento;
    let idTipo = null;
    if (rawTipo !== undefined && rawTipo !== null && String(rawTipo).trim() !== '') {
      idTipo = parseInt(String(rawTipo), 10);
      if (Number.isNaN(idTipo)) {
        return res.status(400).json({ error: 'id_tipo_documento inválido' });
      }
    }

    const sql = `
      SELECT 
        d.id_documento,
        d.numero,
        d.id_tipo_documento,
        td.nombre AS tipo_documento,
        d.asignado_a,
        u.nombre AS asignado_por,
        d.asignado_en
      FROM documentos d
      JOIN tipos_documento td 
        ON td.id_tipo_documento = d.id_tipo_documento
      JOIN usuarios u 
        ON u.id_usuario = d.asignado_por
      ${idTipo !== null ? 'WHERE d.id_tipo_documento = $1' : ''}
      ORDER BY d.asignado_en DESC
    `;

    const result =
      idTipo !== null
        ? await db.query(sql, [idTipo])
        : await db.query(sql);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener tipos de documento (debe ir antes de /:id para evitar conflictos)
router.get('/tipos', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id_tipo_documento, nombre
       FROM tipos_documento
       ORDER BY nombre`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un documento por ID (debe ir al final)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(`
      SELECT 
        d.id_documento,
        d.numero,
        d.id_tipo_documento,
        td.nombre AS tipo_documento,
        d.asignado_a,
        d.asignado_por,
        u.nombre AS asignado_por_nombre,
        d.asignado_en
      FROM documentos d
      JOIN tipos_documento td 
        ON td.id_tipo_documento = d.id_tipo_documento
      JOIN usuarios u 
        ON u.id_usuario = d.asignado_por
      WHERE d.id_documento = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Modificar un documento (solo admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { asignado_a, es_admin, id_usuario } = req.body;

    // Verificar que sea admin (acepta true, 'true', 't', 1, '1')
    const isAdmin = es_admin === true || 
                    es_admin === 'true' || 
                    es_admin === 't' || 
                    es_admin === 1 || 
                    es_admin === '1';
    
    if (!isAdmin) {
      // Si no viene es_admin en el body, verificar directamente en la BD
      if (id_usuario) {
        const userCheck = await db.query(
          'SELECT es_admin FROM usuarios WHERE id_usuario = $1',
          [id_usuario]
        );
        if (userCheck.rows.length === 0) {
          return res.status(403).json({ error: 'Acceso denegado. Usuario no encontrado.' });
        }
        
        // Verificar si es admin en la BD
        const userEsAdmin = userCheck.rows[0].es_admin;
        const isUserAdmin = userEsAdmin === true || 
                           userEsAdmin === 'true' || 
                           userEsAdmin === 't' || 
                           userEsAdmin === 1 || 
                           userEsAdmin === '1';
        
        if (!isUserAdmin) {
          return res.status(403).json({ error: 'Acceso denegado. Se requiere permisos de administrador.' });
        }
      } else {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere permisos de administrador.' });
      }
    }

    if (!asignado_a) {
      return res.status(400).json({ error: 'El campo asignado_a es requerido' });
    }

    // Verificar que el documento existe
    const docCheck = await db.query('SELECT id_documento FROM documentos WHERE id_documento = $1', [id]);
    if (docCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    // Actualizar el documento
    const result = await db.query(
      `UPDATE documentos 
       SET asignado_a = $1 
       WHERE id_documento = $2 
       RETURNING id_documento, numero, asignado_a`,
      [asignado_a, id]
    );

    res.json({ 
      message: 'Documento actualizado exitosamente',
      documento: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un documento (solo admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { es_admin, id_usuario } = req.body;

    // Verificar que sea admin (acepta true, 'true', 't', 1, '1')
    const isAdmin = es_admin === true || 
                    es_admin === 'true' || 
                    es_admin === 't' || 
                    es_admin === 1 || 
                    es_admin === '1';
    
    if (!isAdmin) {
      // Si no viene es_admin en el body, verificar directamente en la BD
      if (id_usuario) {
        const userCheck = await db.query(
          'SELECT es_admin FROM usuarios WHERE id_usuario = $1',
          [id_usuario]
        );
        if (userCheck.rows.length === 0) {
          return res.status(403).json({ error: 'Acceso denegado. Usuario no encontrado.' });
        }
        
        // Verificar si es admin en la BD
        const userEsAdmin = userCheck.rows[0].es_admin;
        const isUserAdmin = userEsAdmin === true || 
                           userEsAdmin === 'true' || 
                           userEsAdmin === 't' || 
                           userEsAdmin === 1 || 
                           userEsAdmin === '1';
        
        if (!isUserAdmin) {
          return res.status(403).json({ error: 'Acceso denegado. Se requiere permisos de administrador.' });
        }
      } else {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere permisos de administrador.' });
      }
    }

    // Verificar que el documento existe
    const docCheck = await db.query('SELECT id_documento, numero FROM documentos WHERE id_documento = $1', [id]);
    if (docCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    // Eliminar el documento
    await db.query('DELETE FROM documentos WHERE id_documento = $1', [id]);

    res.json({ 
      message: 'Documento eliminado exitosamente',
      numero: docCheck.rows[0].numero
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
