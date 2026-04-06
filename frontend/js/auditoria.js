document.addEventListener('DOMContentLoaded', function() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  // Verificar si es admin (acepta true, 'true', 't', 1, '1')
  const esAdmin = usuario && (
    usuario.es_admin === true || 
    usuario.es_admin === 'true' || 
    usuario.es_admin === 't' || 
    usuario.es_admin === 1 || 
    usuario.es_admin === '1'
  );

  if (!usuario || !esAdmin) {
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    overlay.classList.add('active');
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 500);
    return;
  }

  async function cargarAuditoria() {
    try {
      const res = await fetch('https://asignacion-documentos-production.up.railway.app/api/auditoria?es_admin=true');
      
      if (!res.ok) {
        throw new Error('Error al cargar auditoría');
      }

      const auditoria = await res.json();
      const tbody = document.getElementById('tablaAuditoria');
      tbody.innerHTML = '';

      if (auditoria.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #6b7280;">No hay registros de auditoría</td></tr>';
        return;
      }

      auditoria.forEach((a, index) => {
        const tr = document.createElement('tr');
        tr.style.animationDelay = `${index * 0.05}s`;

        // Determinar badge según acción
        let badgeClass = 'badge-insert';
        if (a.accion.toLowerCase().includes('actualiz')) {
          badgeClass = 'badge-update';
        } else if (a.accion.toLowerCase().includes('elimin')) {
          badgeClass = 'badge-delete';
        }

        tr.innerHTML = `
          <td><span class="badge ${badgeClass}">${a.accion}</span></td>
          <td>${a.tipo_documento || '-'}</td>
          <td><strong>${a.numero || '-'}</strong></td>
          <td>${a.asignado_a || '-'}</td>
          <td>${a.asignado_por || '-'}</td>
          <td>${new Date(a.fecha).toLocaleString('es-ES')}</td>
        `;

        tbody.appendChild(tr);
      });
    } catch (error) {
      const tbody = document.getElementById('tablaAuditoria');
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #dc2626;">Error al cargar auditoría</td></tr>';
      }
    }
  }

  cargarAuditoria();
});
