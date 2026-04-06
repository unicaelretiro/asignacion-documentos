document.addEventListener('DOMContentLoaded', function() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  if (!usuario) {
    window.location.href = 'login.html';
    return;
  }

  // Verificar si es admin (acepta true, 'true', 't', 1, '1')
  const esAdmin = usuario.es_admin === true || 
                  usuario.es_admin === 'true' || 
                  usuario.es_admin === 't' || 
                  usuario.es_admin === 1 || 
                  usuario.es_admin === '1';
  const modal = document.getElementById('modalEditar');
  const formEditar = document.getElementById('formEditar');
  const thAcciones = document.getElementById('thAcciones');
  const loadingRow = document.getElementById('loadingRow');

  // Mostrar columna de acciones si es admin
  if (esAdmin && thAcciones) {
    thAcciones.style.display = 'table-cell';
    if (loadingRow) {
      loadingRow.setAttribute('colspan', '6');
    }
  } else {
    if (loadingRow) {
      loadingRow.setAttribute('colspan', '5');
    }
  }

  // Cargar usuarios para el select del modal
  async function cargarUsuarios() {
    try {
      const res = await fetch('https://asignacion-documentos-production.up.railway.app/api/usuarios');
      const usuarios = await res.json();
      const select = document.getElementById('editAsignadoA');
      
      if (select) {
        select.innerHTML = '<option value="">Seleccione usuario...</option>';
        usuarios.forEach(u => {
          const option = document.createElement('option');
          option.value = u.nombre;
          option.textContent = u.nombre;
          select.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  }

  cargarUsuarios();

  // Cerrar modal
  function cerrarModal() {
    if (modal) {
      modal.style.display = 'none';
      formEditar.reset();
      document.getElementById('mensajeEditar').innerHTML = '';
    }
  }

  document.getElementById('cerrarModal')?.addEventListener('click', cerrarModal);
  document.getElementById('cancelarEditar')?.addEventListener('click', cerrarModal);
  
  // Cerrar al hacer click fuera del modal
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        cerrarModal();
      }
    });
  }

  // Editar documento
  async function editarDocumento(idDocumento) {
    try {
      const res = await fetch(`https://asignacion-documentos-production.up.railway.app/api/documentos/${idDocumento}`);
      const documento = await res.json();

      document.getElementById('editIdDocumento').value = documento.id_documento;
      document.getElementById('editNumero').value = documento.numero;
      document.getElementById('editTipo').value = documento.tipo_documento;
      document.getElementById('editAsignadoA').value = documento.asignado_a;

      if (modal) {
        modal.style.display = 'flex';
      }
    } catch (error) {
      alert('Error al cargar el documento: ' + error.message);
    }
  }

  // Guardar cambios
  formEditar?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const idDocumento = document.getElementById('editIdDocumento').value;
    const asignadoA = document.getElementById('editAsignadoA').value;
    const mensajeEditar = document.getElementById('mensajeEditar');
    const submitBtn = formEditar.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;

    if (!asignadoA) {
      mensajeEditar.innerHTML = '<div class="alert alert-error">Seleccione un usuario</div>';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';

    try {
      const res = await fetch(`https://asignacion-documentos-production.up.railway.app/api/documentos/${idDocumento}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asignado_a: asignadoA,
          es_admin: usuario.es_admin,
          id_usuario: usuario.id_usuario
        })
      });

      const data = await res.json();

      if (res.ok) {
        mensajeEditar.innerHTML = '<div class="alert alert-success">✓ Documento actualizado exitosamente</div>';
        setTimeout(() => {
          cerrarModal();
          cargarDocumentos();
        }, 1000);
      } else {
        mensajeEditar.innerHTML = `<div class="alert alert-error">❌ ${data.error}</div>`;
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    } catch (error) {
      mensajeEditar.innerHTML = '<div class="alert alert-error">❌ Error de conexión</div>';
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });

  // Eliminar documento
  async function eliminarDocumento(idDocumento, numero) {
    if (!confirm(`¿Está seguro de eliminar el documento ${numero}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const res = await fetch(`https://asignacion-documentos-production.up.railway.app/api/documentos/${idDocumento}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          es_admin: usuario.es_admin,
          id_usuario: usuario.id_usuario
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert('Documento eliminado exitosamente');
        cargarDocumentos();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error de conexión: ' + error.message);
    }
  }

  async function cargarDocumentos() {
    try {
      const res = await fetch('https://asignacion-documentos-production.up.railway.app/api/documentos');
      const documentos = await res.json();

      const tbody = document.getElementById('tablaDocumentos');
      if (!tbody) return;

      tbody.innerHTML = '';

      if (documentos.length === 0) {
        const colspan = esAdmin ? 6 : 5;
        tbody.innerHTML = `<tr><td colspan="${colspan}" style="text-align: center; padding: 40px; color: #6b7280;">No hay documentos asignados aún</td></tr>`;
        return;
      }

      documentos.forEach((d, index) => {
        const tr = document.createElement('tr');
        tr.style.animationDelay = `${index * 0.05}s`;

        let accionesHTML = '';
        if (esAdmin) {
          accionesHTML = `
            <td>
              <button class="btn-edit" onclick="window.editarDoc(${d.id_documento})">Editar</button>
              <button class="btn-delete" onclick="window.eliminarDoc(${d.id_documento}, '${d.numero}')">Eliminar</button>
            </td>
          `;
        }

        tr.innerHTML = `
          <td><strong>${d.numero}</strong></td>
          <td>${d.tipo_documento}</td>
          <td>${d.asignado_a}</td>
          <td>${d.asignado_por}</td>
          <td>${new Date(d.asignado_en).toLocaleString('es-ES')}</td>
          ${accionesHTML}
        `;

        tbody.appendChild(tr);
      });
    } catch (error) {
      const tbody = document.getElementById('tablaDocumentos');
      if (tbody) {
        const colspan = esAdmin ? 6 : 5;
        tbody.innerHTML = `<tr><td colspan="${colspan}" style="text-align: center; padding: 40px; color: #dc2626;">Error al cargar documentos</td></tr>`;
      }
    }
  }

  // Exponer funciones globalmente para los botones onclick
  window.editarDoc = editarDocumento;
  window.eliminarDoc = eliminarDocumento;

  cargarDocumentos();
});
