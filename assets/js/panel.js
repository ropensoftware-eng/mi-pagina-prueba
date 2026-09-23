/* ==========================================================================
   SucreGas — Panel del cliente (mi-cuenta.html)
   Perfil · Pedidos · Pagos · Facturas · Reclamos · Historial
   ========================================================================== */
(function () {
  "use strict";

  var S = window.Sucre;
  var api = window.SucreApi;
  if (!S || !api) return;

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };
  function escapar(t) {
    var d = document.createElement("div");
    d.textContent = t == null ? "" : String(t);
    return d.innerHTML;
  }
  function msg(el, type, text) {
    if (!el) return;
    el.className = "msg msg--" + type + " is-show";
    el.textContent = text;
  }

  var contenido = $("[data-panel-contenido]");
  var requiere = $("[data-panel-requiere]");
  var usuario = S.currentUser();

  if (!usuario) {
    if (requiere) requiere.style.display = "block";
    if (contenido) contenido.style.display = "none";
    return;
  }
  if (requiere) requiere.style.display = "none";
  if (contenido) contenido.style.display = "block";

  /* ------------------------- Datos del usuario ------------------------- */
  function pintarUsuario(u) {
    u = u || usuario;
    var iniciales = (u.nombre || "?").trim().split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase();
    var av = $("[data-panel-avatar]"); if (av) av.textContent = iniciales;
    var nom = $("[data-panel-nombre]"); if (nom) nom.textContent = u.nombre || "—";
    var em = $("[data-panel-email]"); if (em) em.textContent = u.email || "—";
    var ced = $("[data-perfil-cedula]"); if (ced) ced.textContent = u.cedula || "—";
    var inNom = $("[data-perfil-nombre]"); if (inNom) inNom.value = u.nombre || "";
    var inTel = $("[data-perfil-telefono]"); if (inTel) inTel.value = u.telefono || "";
    var inMail = $("[data-perfil-email]"); if (inMail) inMail.value = u.email || "";
    var aviso = $("[data-verify-notice]");
    if (aviso) aviso.style.display = (parseInt(u.verificado || 0, 10) === 1) ? "none" : "flex";
  }
  pintarUsuario(usuario);

  api.perfil().then(function (res) {
    if (!res.ok) return;
    pintarUsuario(res.data);
    if (res.data.ultimo_acceso) {
      var el = $("[data-perfil-ultimo]");
      if (el) el.textContent = res.data.ultimo_acceso;
    }
  });

  /* --------------------------- Navegación --------------------------- */
  function mostrar(nombre) {
    $$(".panel-section").forEach(function (s) {
      s.classList.toggle("is-active", s.getAttribute("data-panel") === nombre);
    });
    $$(".panel-nav__link[data-panel-go]").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-panel-go") === nombre);
    });
  }
  $$(".panel-nav__link[data-panel-go]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-panel-go");
      if (location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
      mostrar(id);
    });
  });
  function seccionDeHash() {
    var partes = (location.hash || "").replace("#", "").split("/");
    return partes[1] || partes[0] || "";
  }
  window.addEventListener("hashchange", function () {
    var h = seccionDeHash();
    if (h && $('[data-panel="' + h + '"]')) mostrar(h);
  });
  (function inicial() {
    var h = seccionDeHash();
    if (h && $('[data-panel="' + h + '"]')) mostrar(h);
  })();

  /* --------------------------- Listas --------------------------- */
  function pintar(sel, items, plantilla, vacio) {
    var cont = $(sel);
    if (!cont) return;
    if (!items || !items.length) {
      cont.innerHTML = '<p class="panel-empty">' + escapar(vacio) + "</p>";
      return;
    }
    cont.innerHTML = items.map(plantilla).join("");
  }

  function cargarPedidos() {
    api.misPedidos().then(function (res) {
      var data = res.ok ? res.data : [];
      var st = $("[data-stat-pedidos]"); if (st) st.textContent = data.length;
      pintar("[data-lista='pedidos']", data, function (p) {
        return '<div class="panel-item"><div><b>Pedido ' + escapar(p.numero) + "</b><span>" + escapar(p.fecha) + " · Bombona " + escapar(p.bombona) + (p.municipio ? " · " + escapar(p.municipio) : "") + "</span></div>" +
          '<span class="badge badge--blue">' + escapar(p.estado || "Recibido") + "</span></div>";
      }, "Aún no tienes pedidos registrados.");
    });
  }

  function cargarPagos() {
    api.misPagos().then(function (res) {
      var data = res.ok ? res.data : [];
      var st = $("[data-stat-pagos]"); if (st) st.textContent = data.length;
      pintar("[data-lista='pagos']", data, function (p) {
        return '<div class="panel-item"><div><b>' + escapar(p.concepto || "Pago") + "</b><span>" + escapar(p.fecha) + " · " + escapar(p.metodo) + " · Ref. " + escapar(p.referencia) + "</span></div>" +
          '<div class="panel-item__right"><b class="tnum">' + escapar(p.monto) + "</b>" +
          '<button class="btn btn-soft btn-sm" type="button" data-recibo="' + escapar(p.comprobante) + '" data-titulo="Comprobante de pago" data-concepto="' + escapar(p.concepto) + '" data-monto="' + escapar(p.monto) + '" data-fecha="' + escapar(p.fecha) + '">Descargar</button></div></div>';
      }, "Aún no tienes pagos registrados.");
    });
  }

  function cargarFacturas() {
    api.misFacturas().then(function (res) {
      var data = res.ok ? res.data : [];
      var pend = data.filter(function (f) { return (f.estado || "").toLowerCase() !== "pagada"; }).length;
      var st = $("[data-stat-facturas]"); if (st) st.textContent = pend;
      pintar("[data-lista='facturas']", data, function (f) {
        var badge = (f.estado || "").toLowerCase() === "pagada" ? "badge--green" : "badge--amber";
        return '<div class="panel-item"><div><b>Factura ' + escapar(f.periodo) + "</b><span>" + escapar(f.concepto || "Servicio de gas") + " · Vence: " + escapar(f.vence || "—") + "</span></div>" +
          '<div class="panel-item__right"><b class="tnum">' + escapar(f.monto) + "</b>" +
          '<span class="badge ' + badge + '">' + escapar(f.estado) + "</span>" +
          '<button class="btn btn-soft btn-sm" type="button" data-recibo="' + escapar(f.periodo) + '" data-titulo="Factura de servicio" data-concepto="' + escapar(f.concepto || "Servicio de gas") + '" data-monto="' + escapar(f.monto) + '" data-fecha="' + escapar(f.fecha) + '">Descargar</button></div></div>';
      }, "Aún no tienes facturas.");
    });
  }

  function cargarReclamos() {
    api.misPQR().then(function (res) {
      pintar("[data-lista='reclamos']", res.ok ? res.data : [], function (p) {
        return '<div class="panel-item"><div><b>Ticket ' + escapar(p.ticket) + "</b><span>" + escapar(p.fecha) + " · " + escapar(p.tipo) + "</span></div>" +
          '<span class="badge badge--amber">' + escapar(p.estado || "Abierto") + "</span></div>";
      }, "Aún no tienes reclamos registrados.");
    });
  }

  function cargarHistorial() {
    api.historial().then(function (res) {
      var data = res.ok ? res.data : [];
      pintar("[data-lista='historial']", data, itemTimeline, "Aún no hay actividad en tu cuenta.");
      pintar("[data-panel-lista='ultimos']", data.slice(0, 5), itemTimeline, "Aún no hay movimientos.");
    });
  }

  function itemTimeline(e) {
    return '<div class="timeline__item"><span class="timeline__dot">' + iconoTipo(e.tipo) + "</span>" +
      '<div class="timeline__txt"><b>' + escapar(e.titulo) + "</b><span>" + escapar(e.detalle || "") + " · " + escapar(e.fecha) + "</span></div></div>";
  }
  function iconoTipo(tipo) {
    var svg = function (p) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + p + "</svg>"; };
    if (tipo === "Pago") return svg('<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M16 12h2"/>');
    if (tipo === "Factura") return svg('<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h6"/>');
    if (tipo === "Reclamo") return svg('<path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="3" y="13" width="4" height="6" rx="2"/><rect x="17" y="13" width="4" height="6" rx="2"/>');
    if (tipo === "Sesión") return svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>');
    return svg('<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>');
  }

  cargarPedidos();
  cargarPagos();
  cargarFacturas();
  cargarReclamos();
  cargarHistorial();

  /* --------------------------- Perfil --------------------------- */
  var perfilForm = $("[data-form='perfil']");
  if (perfilForm) {
    perfilForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var m = $("[data-msg='perfil']");
      var btn = $("button[type='submit']", perfilForm);
      if (btn) { btn.disabled = true; btn.textContent = "Guardando…"; }
      api.actualizarPerfil({
        nombre: ($("[data-perfil-nombre]") || {}).value || "",
        telefono: ($("[data-perfil-telefono]") || {}).value || ""
      }).then(function (res) {
        if (btn) { btn.disabled = false; btn.textContent = "Guardar cambios"; }
        if (!res.ok) { msg(m, "error", res.error || "No se pudo guardar."); return; }
        S.refreshNav();
        pintarUsuario(res.data);
        msg(m, "success", "Datos actualizados correctamente.");
      });
    });
  }

  /* --------------------------- Contraseña --------------------------- */
  function fortaleza(pass) {
    var n = 0;
    if (pass.length >= 8) n++;
    if (pass.length >= 12) n++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) n++;
    if (/\d/.test(pass)) n++;
    if (/[^A-Za-z0-9]/.test(pass)) n++;
    return Math.min(n, 4);
  }
  var nueva = $("[data-pwd-nueva]");
  if (nueva) {
    nueva.addEventListener("input", function () {
      var caja = $("[data-pwd-strength]");
      if (!caja) return;
      var bar = caja.querySelector("i");
      var txt = caja.querySelector("span");
      var f = fortaleza(nueva.value);
      var colores = ["var(--red)", "#f59e0b", "#f59e0b", "var(--green)", "var(--green)"];
      var etiquetas = ["Seguridad de la contraseña", "Débil", "Aceptable", "Buena", "Fuerte"];
      bar.style.width = (f / 4 * 100) + "%";
      bar.style.background = colores[f];
      txt.textContent = etiquetas[f];
    });
  }
  $$(".pwd-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var input = btn.closest(".pwd-wrap").querySelector("input");
      var vis = btn.classList.toggle("is-visible");
      input.type = vis ? "text" : "password";
    });
  });

  var passForm = $("[data-form='password']");
  if (passForm) {
    passForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var m = $("[data-msg='password']");
      var btn = $("button[type='submit']", passForm);
      var actual = ($("[data-pwd-actual]") || {}).value || "";
      var nuevaV = ($("[data-pwd-nueva]") || {}).value || "";
      if (nuevaV.length < 8) { msg(m, "error", "La nueva contraseña debe tener al menos 8 caracteres."); return; }
      if (btn) { btn.disabled = true; btn.textContent = "Actualizando…"; }
      api.cambiarPassword({ actual: actual, nueva: nuevaV }).then(function (res) {
        if (btn) { btn.disabled = false; btn.textContent = "Actualizar contraseña"; }
        if (!res.ok) { msg(m, "error", res.error || "No se pudo actualizar."); return; }
        passForm.reset();
        msg(m, "success", "Contraseña actualizada correctamente.");
      });
    });
  }

  /* --------------------------- Verificación --------------------------- */
  var verBtn = $("[data-verify-btn]");
  if (verBtn) {
    verBtn.addEventListener("click", function () {
      var aviso = $("[data-verify-notice]");
      verBtn.disabled = true;
      verBtn.textContent = "Procesando…";
      if (api.demoMode()) {
        // En demo no hay correo: se marca verificado al instante
        api.verificar({}).then(function (res) {
          verBtn.disabled = false;
          verBtn.textContent = "Verificar ahora";
          if (res.ok) {
            if (aviso) aviso.style.display = "none";
            usuario.verificado = 1;
            S.storeSessionUser(usuario);
          }
        });
      } else {
        // En real: se envía el correo con el enlace de verificación
        api.reenviarVerificacion({}).then(function (res) {
          verBtn.disabled = false;
          verBtn.textContent = "Verificar ahora";
          if (aviso) {
            var span = aviso.querySelector("span");
            if (span) span.textContent = res.ok
              ? "Te enviamos un correo de verificación. Revisa tu bandeja de entrada."
              : (res.error || "No se pudo enviar el correo de verificación.");
          }
          if (res.ok) verBtn.style.display = "none";
        });
      }
    });
  }

  /* --------------------------- Comprobantes --------------------------- */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-recibo]");
    if (!btn) return;
    var u = S.currentUser() || {};
    var w = window.open("", "_blank", "width=520,height=640");
    if (!w) return;
    var html = '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>' + escapar(btn.getAttribute("data-titulo")) + "</title><style>" +
      "body{font-family:Segoe UI,Arial,sans-serif;color:#1c2b3a;padding:28px}h1{font-size:18px;color:#0e3a6b;margin:0 0 4px}p{margin:2px 0;font-size:13px}" +
      ".box{border:1px solid #e3eaf3;border-radius:12px;padding:18px;margin-top:16px}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #e3eaf3;font-size:13px}" +
      ".row:last-child{border-bottom:none}.foot{margin-top:18px;font-size:11px;color:#93a3b8}</style></head><body>" +
      "<h1>SucreGas — " + escapar(btn.getAttribute("data-titulo")) + "</h1><p>Distribuidora de Gas del Estado Sucre</p>" +
      '<div class="box">' +
      '<div class="row"><span>Referencia</span><b>' + escapar(btn.getAttribute("data-recibo")) + "</b></div>" +
      '<div class="row"><span>Cliente</span><b>' + escapar(u.nombre || "") + "</b></div>" +
      '<div class="row"><span>Cédula</span><b>' + escapar(u.cedula || "") + "</b></div>" +
      '<div class="row"><span>Concepto</span><b>' + escapar(btn.getAttribute("data-concepto")) + "</b></div>" +
      '<div class="row"><span>Monto</span><b>' + escapar(btn.getAttribute("data-monto")) + "</b></div>" +
      '<div class="row"><span>Fecha</span><b>' + escapar(btn.getAttribute("data-fecha")) + "</b></div>" +
      "</div><p class=\"foot\">Documento generado desde la Oficina Virtual de SucreGas. Comprobante de referencia.</p></body></html>";
    w.document.write(html);
    w.document.close();
    setTimeout(function () { w.print(); }, 400);
  });

  /* --------------------------- Sesión --------------------------- */
  var salir = $("[data-panel-logout]");
  if (salir) {
    salir.addEventListener("click", function () {
      api.cerrar().then(function () {
        S.storeSessionUser(null);
        S.clearSession();
        S.refreshNav();
        location.href = "cuenta.html";
      });
    });
  }
  var salirTodas = $("[data-cerrar-todas]");
  if (salirTodas) {
    salirTodas.addEventListener("click", function () {
      if (!confirm("¿Cerrar la sesión en todos los dispositivos?")) return;
      api.cerrarTodas().then(function () {
        S.storeSessionUser(null);
        S.clearSession();
        S.refreshNav();
        location.href = "cuenta.html";
      });
    });
  }
})();
