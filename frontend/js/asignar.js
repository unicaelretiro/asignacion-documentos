document.addEventListener('DOMContentLoaded', function() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  if (!usuario) {
    window.location.href = 'login.html';
    return;
  }

  const form = document.getElementById('formAsignar');
  const resultado = document.getElementById('resultado');
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;

  // Cargar tipos de documento
  async function cargarTipos() {
    try {
      const res = await fetch('http://localhost:3000/api/documentos/tipos');
      const tipos = await res.json();

      const select = document.getElementById('tipoDocumento');
      select.innerHTML = '<option value="">Seleccione...</option>';

      tipos.forEach((t, index) => {
        const option = document.createElement('option');
        option.value = t.id_tipo_documento;
        option.textContent = t.nombre;
        option.style.animationDelay = `${index * 0.05}s`;
        select.appendChild(option);
      });
    } catch (error) {
      resultado.innerHTML = '<div class="alert alert-error">❌ Error al cargar tipos de documento</div>';
    }
  }

  // Cargar usuarios
  async function cargarUsuarios() {
    try {
      const res = await fetch('http://localhost:3000/api/usuarios');
      const usuarios = await res.json();

      const select = document.getElementById('asignadoA');
      select.innerHTML = '<option value="">Seleccione usuario...</option>';

      usuarios.forEach((u, index) => {
        const option = document.createElement('option');
        option.value = u.nombre;
        option.textContent = u.nombre;
        option.style.animationDelay = `${index * 0.05}s`;
        select.appendChild(option);
      });
    } catch (error) {
      resultado.innerHTML = '<div class="alert alert-error">❌ Error al cargar usuarios</div>';
    }
  }

  // Asignar documento
  async function asignarDocumento(e) {
    e.preventDefault();

    const id_tipo_documento = document.getElementById('tipoDocumento').value;
    const asignado_a = document.getElementById('asignadoA').value;

    if (!id_tipo_documento) {
      resultado.innerHTML = '<div class="alert alert-error">❌ Seleccione un tipo de documento</div>';
      return;
    }

    if (!asignado_a) {
      resultado.innerHTML = '<div class="alert alert-error">❌ Seleccione un usuario</div>';
      return;
    }

    // Mostrar loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Asignando...';
    resultado.innerHTML = '';

    try {
      const res = await fetch('http://localhost:3000/api/documentos/asignar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_tipo_documento,
          asignado_a,
          id_usuario: usuario.id_usuario
        })
      });

      const data = await res.json();

      if (res.ok) {
        resultado.innerHTML = `
          <div class="alert alert-success">
            ✅ <strong>Documento asignado exitosamente</strong><br>
            Número: <strong>${data.numero}</strong>
          </div>
        `;
        
        // Limpiar formulario
        form.reset();
        document.getElementById('tipoDocumento').innerHTML = '<option value="">Seleccione...</option>';
        document.getElementById('asignadoA').innerHTML = '<option value="">Seleccione usuario...</option>';
        
        // Recargar opciones
        setTimeout(() => {
          cargarTipos();
          cargarUsuarios();
        }, 500);
      } else {
        resultado.innerHTML = `<div class="alert alert-error">❌ ${data.error}</div>`;
      }
    } catch (error) {
      resultado.innerHTML = '<div class="alert alert-error">❌ Error de conexión. Verifique que el servidor esté corriendo.</div>';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  }

  // Event listener
  form.addEventListener('submit', asignarDocumento);

  // Cargar datos iniciales
  cargarTipos();
  cargarUsuarios();
});
