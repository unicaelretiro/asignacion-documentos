document.addEventListener('DOMContentLoaded', function () {
  const API_BASE = 'https://asignacion-documentos-production.up.railway.app';

  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const esAdmin =
    usuario &&
    (usuario.es_admin === true ||
      usuario.es_admin === 'true' ||
      usuario.es_admin === 't' ||
      usuario.es_admin === 1 ||
      usuario.es_admin === '1');

  if (!usuario || !esAdmin) {
    window.location.href = 'dashboard.html';
    return;
  }

  const tbody = document.getElementById('tablaParametros');
  const mensajeGlobal = document.getElementById('mensajeGlobal');

  function fmtMax(v) {
    if (v === null || v === undefined) return '—';
    return String(v);
  }

  async function cargar() {
    mensajeGlobal.innerHTML = '';
    try {
      const res = await fetch(
        `${API_BASE}/api/parametrizacion?es_admin=true&id_usuario=${encodeURIComponent(usuario.id_usuario)}`
      );
      const data = await res.json();

      if (!res.ok) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:40px;color:#dc2626;">${data.error || 'Error al cargar'}</td></tr>`;
        return;
      }

      if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="4" style="text-align:center;padding:40px;color:#6b7280;">No hay tipos de documento</td></tr>';
        return;
      }

      tbody.innerHTML = '';
      data.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.style.animationDelay = `${index * 0.04}s`;
        const id = row.id_tipo_documento;
        const ultimo = row.ultimo_numero !== undefined && row.ultimo_numero !== null ? row.ultimo_numero : 0;

        tr.innerHTML = `
          <td><strong>${row.nombre}</strong></td>
          <td>
            <input type="number" min="0" step="1" class="input-ultimo" data-id="${id}" value="${ultimo}"
              style="width: 140px; padding: 8px 10px; border-radius: 6px; border: 1px solid #d1d5db;">
          </td>
          <td style="color: #6b7280;">${fmtMax(row.max_numero_en_documentos)}</td>
          <td>
            <button type="button" class="nav-btn btn-guardar-param" data-id="${id}" style="background:#059669;">Guardar</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      tbody.querySelectorAll('.btn-guardar-param').forEach((btn) => {
        btn.addEventListener('click', () => guardarFila(parseInt(btn.getAttribute('data-id'), 10)));
      });
    } catch (e) {
      tbody.innerHTML =
        '<tr><td colspan="4" style="text-align:center;padding:40px;color:#dc2626;">Error de conexión</td></tr>';
    }
  }

  async function guardarFila(idTipo) {
    const input = tbody.querySelector(`.input-ultimo[data-id="${idTipo}"]`);
    if (!input) return;

    const raw = input.value;
    if (raw === '' || raw === null) {
      mensajeGlobal.innerHTML = '<div class="alert alert-error">Indique un número</div>';
      return;
    }

    const ultimo = parseInt(String(raw), 10);
    if (Number.isNaN(ultimo) || ultimo < 0) {
      mensajeGlobal.innerHTML = '<div class="alert alert-error">Número no válido</div>';
      return;
    }

    mensajeGlobal.innerHTML = '';
    const btn = tbody.querySelector(`.btn-guardar-param[data-id="${idTipo}"]`);
    const prev = btn ? btn.textContent : '';
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Guardando…';
    }

    try {
      const res = await fetch(`${API_BASE}/api/parametrizacion/${idTipo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ultimo_numero: ultimo,
          es_admin: usuario.es_admin,
          id_usuario: usuario.id_usuario
        })
      });
      const data = await res.json();

      if (res.ok) {
        mensajeGlobal.innerHTML =
          '<div class="alert alert-success">✓ Guardado. El próximo número al asignar será <strong>' +
          (ultimo + 1) +
          '</strong> para ese tipo.</div>';
        setTimeout(() => {
          mensajeGlobal.innerHTML = '';
        }, 5000);
        await cargar();
      } else {
        mensajeGlobal.innerHTML = `<div class="alert alert-error">❌ ${data.error || 'Error'}</div>`;
      }
    } catch (e) {
      mensajeGlobal.innerHTML = '<div class="alert alert-error">❌ Error de conexión</div>';
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = prev || 'Guardar';
      }
    }
  }

  cargar();
});
