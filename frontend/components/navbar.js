function cargarNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;

  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const nombreUsuario = usuario ? usuario.nombre : 'Usuario';
  const esAdmin =
    usuario &&
    (usuario.es_admin === true ||
      usuario.es_admin === 'true' ||
      usuario.es_admin === 't' ||
      usuario.es_admin === 1 ||
      usuario.es_admin === '1');
  const btnParametrizar = esAdmin
    ? '<button class="nav-btn" data-href="parametrizar.html">Parametrizar</button>'
    : '';

  nav.innerHTML = `
    <div class="navbar">
      <h1>Asignación de Documentos</h1>
      <div class="navbar-content">
        <div class="navbar-buttons">
          <button class="nav-btn" data-href="dashboard.html">Inicio</button>
          <button class="nav-btn" data-href="asignar.html">Asignar</button>
          <button class="nav-btn" data-href="documentos.html">Documentos</button>
          ${btnParametrizar}
          <button class="nav-btn" data-href="auditoria.html">Auditoría</button>
        </div>
        <div class="navbar-user">
          <span class="user-name">${nombreUsuario}</span>
          <button class="nav-btn nav-btn-logout" data-href="login.html">Salir</button>
        </div>
      </div>
    </div>
  `;
  
  // Agregar event listeners a los botones
  const buttons = nav.querySelectorAll('.nav-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', function() {
      const href = this.getAttribute('data-href');
      if (href) {
        if (href.includes('login.html')) {
          localStorage.removeItem('usuario');
        }
        // Usar el sistema de navegación si está disponible
        if (window.navigateTo) {
          window.navigateTo(href);
        } else {
          window.location.href = href;
        }
      }
    });
  });
  
  // Disparar evento personalizado para notificar que el navbar se cargó
  const event = new CustomEvent('navbarLoaded');
  document.dispatchEvent(event);
}

// Cargar navbar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', cargarNavbar);
} else {
  cargarNavbar();
}
