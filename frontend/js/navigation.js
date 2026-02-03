// Sistema de navegación con transiciones
(function() {
  'use strict';

  // Crear overlay de transición
  const overlay = document.createElement('div');
  overlay.className = 'page-transition-overlay';
  document.body.appendChild(overlay);

  function navigateTo(url) {
    // Activar overlay
    overlay.classList.add('active');
    document.body.classList.add('page-transitioning');

    // Esperar un momento para que la animación se vea
    setTimeout(() => {
      window.location.href = url;
    }, 300);
  }
  
  // Exponer navigateTo globalmente para que el navbar lo use
  window.navigateTo = navigateTo;

  function attachNavigationListeners() {
    // Buscar todos los enlaces internos (incluyendo los que se agregaron dinámicamente)
    const links = document.querySelectorAll('a[href$=".html"]');
    
    links.forEach(link => {
      // Evitar agregar múltiples listeners
      if (link.dataset.navListener === 'attached') {
        return;
      }
      link.dataset.navListener = 'attached';
      
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // No interceptar si es un enlace externo o tiene target="_blank"
        if (this.target === '_blank' || href.startsWith('http')) {
          return;
        }

        // Si es el enlace de "Salir", limpiar localStorage
        if (href.includes('login.html')) {
          localStorage.removeItem('usuario');
        }

        e.preventDefault();
        navigateTo(href);
      });
    });
    
    // También manejar botones con data-href (navbar)
    const buttons = document.querySelectorAll('button[data-href$=".html"]');
    buttons.forEach(button => {
      if (button.dataset.navListener === 'attached') {
        return;
      }
      button.dataset.navListener = 'attached';
      
      button.addEventListener('click', function(e) {
        const href = this.getAttribute('data-href');
        if (href && !href.startsWith('http')) {
          if (href.includes('login.html')) {
            localStorage.removeItem('usuario');
          }
          navigateTo(href);
        }
      });
    });
  }

  // Escuchar cuando el navbar se carga
  document.addEventListener('navbarLoaded', function() {
    setTimeout(attachNavigationListeners, 50);
  });

  // Interceptar todos los enlaces internos cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', function() {
    attachNavigationListeners();
    
    // Observar cambios en el DOM para enlaces dinámicos (como el navbar)
    const observer = new MutationObserver(function(mutations) {
      attachNavigationListeners();
    });
    
    // Observar cambios en el body
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });

  // También ejecutar inmediatamente si el DOM ya está cargado
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachNavigationListeners);
  } else {
    attachNavigationListeners();
  }

  // Animación de entrada cuando se carga la página
  window.addEventListener('load', function() {
    document.body.classList.remove('page-loading');
    const container = document.querySelector('.container');
    if (container) {
      container.classList.add('page-content');
    }
    // Asegurar que los listeners estén adjuntos después de cargar
    setTimeout(attachNavigationListeners, 100);
  });

  // Agregar clase de carga inicial
  document.body.classList.add('page-loading');
})();
