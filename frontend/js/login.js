document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('loginForm');
  const mensaje = document.getElementById('mensaje');
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;

  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;

    // Mostrar loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Ingresando...';
    mensaje.innerHTML = '';

    try {
      const res = await fetch('https://asignacion-documentos-production.up.railway.app/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('usuario', JSON.stringify(data));
        
        // Mostrar mensaje de éxito
        mensaje.innerHTML = '<div class="alert alert-success">✓ Iniciando sesión...</div>';
        
        // Transición suave
        setTimeout(() => {
          document.body.classList.add('page-transitioning');
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 300);
        }, 500);
      } else {
        mensaje.innerHTML = `<div class="alert alert-error">❌ ${data.error}</div>`;
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
        
        // Animación de shake en el formulario
        form.style.animation = 'shake 0.5s';
        setTimeout(() => {
          form.style.animation = '';
        }, 500);
      }
    } catch (error) {
      mensaje.innerHTML = '<div class="alert alert-error">❌ Error de conexión. Verifique que el servidor esté corriendo.</div>';
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });
});

// Animación shake
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
`;
document.head.appendChild(style);
