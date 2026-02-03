// Middleware para verificar si el usuario es administrador
function requireAdmin(req, res, next) {
  // En una aplicación real, aquí verificarías el token JWT o sesión
  // Por ahora, asumimos que el frontend envía es_admin en el body o headers
  const { es_admin } = req.body;
  
  // Verificar si es admin (acepta true, 'true', 't', 1, '1')
  const isAdmin = es_admin === true || 
                  es_admin === 'true' || 
                  es_admin === 't' || 
                  es_admin === 1 || 
                  es_admin === '1';
  
  if (!isAdmin) {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere permisos de administrador.' });
  }
  
  next();
}

// Función helper para verificar si un valor es admin
function isAdminValue(value) {
  return value === true || 
         value === 'true' || 
         value === 't' || 
         value === 1 || 
         value === '1';
}

module.exports = { requireAdmin, isAdminValue };
