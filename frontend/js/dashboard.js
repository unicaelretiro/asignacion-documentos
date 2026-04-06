document.addEventListener('DOMContentLoaded', function() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  if (!usuario) {
    window.location.href = 'login.html';
    return;
  }

  // Mostrar nombre de usuario si hay un elemento para ello
  const usuarioNombre = document.getElementById('usuarioNombre');
  if (usuarioNombre) {
    usuarioNombre.textContent = usuario.nombre;
  }

  async function cargarDocumentos() {
    try {
      const res = await fetch('https://asignacion-documentos-production.up.railway.app/api/documentos');
      const documentos = await res.json();

      const tbody = document.getElementById('tablaDocumentos');
      if (!tbody) return;

      tbody.innerHTML = '';

      if (documentos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #6b7280;">No hay documentos asignados aún</td></tr>';
        return;
      }

      documentos.forEach((d, index) => {
        const tr = document.createElement('tr');
        tr.style.animationDelay = `${index * 0.05}s`;

        tr.innerHTML = `
          <td><strong>${d.numero}</strong></td>
          <td>${d.tipo_documento}</td>
          <td>${d.asignado_a}</td>
          <td>${d.asignado_por}</td>
          <td>${new Date(d.asignado_en).toLocaleString('es-ES')}</td>`;

        tbody.appendChild(tr);
      });
    } catch (error) {
      const tbody = document.getElementById('tablaDocumentos');
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #dc2626;">Error al cargar documentos</td></tr>';
      }
    }
  }

  cargarDocumentos();
});
