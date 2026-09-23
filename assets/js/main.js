/* ==========================================================================
   SucreGas — JavaScript compartido
   Inyecta cabecera/pie, navegación, interacciones y simulaciones de demo.
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     Datos de contacto — PLACEHOLDER (TODO: confirmar números y correo reales)
  ------------------------------------------------------------------------ */
  var CONTACT = {
    central: "(0293) 000-0000",
    emergency: "0800-000-0000",
    email: "contacto@sucregas.gob.ve",
    address: "Av. Perimetral Cacique Maragüey, Cumaná, Estado Sucre"
  };

  /* ------------------------------------------------------------------------
     Iconos (línea fina, 24x24)
  ------------------------------------------------------------------------ */
  function icon(name) {
    var paths = {
      flame: '<path d="M12 3 C 7.5 8 6 10.8 6 14 a6 6 0 0 0 12 0 c0 -3.2 -1.5 -6 -6 -11 Z"/>',
      person: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
      truck: '<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
      wallet: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M16 12h2"/>',
      file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h6"/>',
      headset: '<path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="3" y="13" width="4" height="6" rx="2"/><rect x="17" y="13" width="4" height="6" rx="2"/>',
      phone: '<path d="M5 4h4l1.5 4-2 1.5a11 11 0 0 0 6 6L16 13.5l4 1.5v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
      mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
      pin: '<path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z"/><circle cx="12" cy="10" r="2.5"/>',
      arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
      chev: '<path d="m6 9 6 6 6-6"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      shield: '<path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/>',
      check: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-4.5"/>',
      alert: '<path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4M12 18h.01"/>',
      info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || "") + "</svg>";
  }

  /* ------------------------------------------------------------------------
     Navegación
  ------------------------------------------------------------------------ */
  var NAV = [
    { href: "index.html", label: "Inicio", key: "inicio" },
    { href: "servicios.html", label: "Servicios", key: "servicios" },
    { href: "rutas.html", label: "Rutas", key: "rutas" },
    { href: "atencion.html", label: "Atención", key: "atencion" },
    { href: "nosotros.html", label: "Nosotros", key: "nosotros" },
    { href: "oficina-virtual.html", label: "Comercios / Express", key: "oficina" }
  ];

  var page = document.body.getAttribute("data-page") || "";

  function navLinksHTML() {
    return NAV.map(function (item) {
      var current = item.key === page ? ' aria-current="page"' : "";
      return '<li><a href="' + item.href + '"' + current + '>' + item.label + "</a></li>";
    }).join("");
  }

  function brandHTML() {
    return (
      '<a class="brand" href="index.html">' +
        '<img class="brand-logo" src="assets/img/logo.png" alt="Logo de SucreGas">' +
        '<span>SucreGas<small>Estado Sucre · GLP</small></span>' +
      "</a>"
    );
  }

  function headerHTML() {
    return (
      '<div class="nav-shell">' +
        '<div class="nav">' +
          brandHTML() +
          '<ul class="nav-links">' + navLinksHTML() + "</ul>" +
          '<div class="nav-cta">' +
            '<div class="acc-menu" data-acc-menu></div>' +
            '<a class="btn btn-primary btn-sm" href="servicios.html#pedir">' + icon("flame") + "<span>Pedir Gas</span></a>" +
          "</div>" +
          '<button class="nav-toggle" type="button" aria-label="Abrir menú" aria-expanded="false">' +
            "<span></span><span></span><span></span>" +
          "</button>" +
        "</div>" +
      "</div>"
    );
  }

  function mobileMenuHTML() {
    return (
      '<div class="mobile-menu" aria-hidden="true">' +
        '<div class="mobile-menu__panel">' +
          '<button class="nav-toggle is-open" type="button" aria-label="Cerrar menú" aria-expanded="true">' +
            "<span></span><span></span><span></span>" +
          "</button>" +
          '<ul class="mobile-menu__links">' +
            NAV.map(function (item, i) {
              var current = item.key === page ? ' aria-current="page"' : "";
              return '<li style="transition-delay:' + (60 + i * 50) + 'ms"><a href="' + item.href + '"' + current + '>' + item.label + "</a></li>";
            }).join("") +
          "</ul>" +
          '<div class="mobile-menu__cta">' +
            '<div class="mobile-menu__acc" data-mobile-acc></div>' +
            '<a class="btn btn-primary btn-block" style="margin-top:10px" href="servicios.html#pedir">' + icon("flame") + "<span>Pedir Gas</span></a>" +
            '<a class="btn btn-ghost btn-block" style="margin-top:10px" href="atencion.html#emergencias">' + icon("phone") + "<span>Centro de Atención</span></a>" +
          "</div>" +
        "</div>" +
      "</div>"
    );
  }

  function footerHTML() {
    return (
      '<div class="container">' +
        '<div class="footer-grid">' +
          '<div class="footer-brand">' +
            brandHTML() +
            '<p>Empresa regional encargada de la distribución de Gas Licuado de Petróleo (GLP) en el Estado Sucre. <em style="color:#8fb8ea">¡Energía que mueve a Sucre!</em></p>' +
          "</div>" +
          '<div class="footer-col">' +
            "<h4>Servicios</h4>" +
            "<ul>" +
              '<li><a href="servicios.html#comunidades">Comunidades</a></li>' +
              '<li><a href="servicios.html#granel-residencial">Granel Residencial</a></li>' +
              '<li><a href="servicios.html#comercial">Comercial</a></li>' +
              '<li><a href="servicios.html#institucional">Institucional</a></li>' +
              '<li><a href="servicios.html#atencion-directa">Atención Directa</a></li>' +
              '<li><a href="servicios.html#tarifas">Tarifas vigentes</a></li>' +
            "</ul>" +
          "</div>" +
          '<div class="footer-col">' +
            "<h4>Información</h4>" +
            "<ul>" +
              '<li><a href="rutas.html">Rutas y Distribución</a></li>' +
              '<li><a href="oficina-virtual.html">Comercios / Express</a></li>' +
              '<li><a href="atencion.html#pqr">Quejas y Reclamos (PQR)</a></li>' +
               '<li><a href="atencion.html#faq">Preguntas Frecuentes</a></li>' +
               '<li><a href="nosotros.html">Nosotros</a></li>' +
               '<li><a href="privacidad.html">Política de Privacidad</a></li>' +
               '<li><a href="terminos.html">Términos y Condiciones</a></li>' +
               '<li><a href="cookies.html">Política de Cookies</a></li>' +
             "</ul>" +
           "</div>" +
          '<div class="footer-col">' +
            "<h4>Contacto</h4>" +
            "<ul>" +
              "<li>" + icon("pin") + "<span>" + CONTACT.address + "</span></li>" +
              "<li>" + icon("phone") + "<span>" + CONTACT.central + "</span></li>" +
              "<li>" + icon("phone") + "<span>Centro de Atención Directa SucreGas: " + CONTACT.emergency + "</span></li>" +
              "<li>" + icon("mail") + "<span>" + CONTACT.email + "</span></li>" +
            "</ul>" +
          "</div>" +
        "</div>" +
        '<div class="footer-bottom">' +
          "<span>© " + new Date().getFullYear() + " SucreGas — Distribuidora regional de GLP del Estado Sucre.</span>" +
          '<span style="color:#5c7a97">Datos de contacto de ejemplo — pendientes de confirmación.</span>' +
        "</div>" +
      "</div>"
    );
  }

  /* ------------------------------------------------------------------------
     Toast
  ------------------------------------------------------------------------ */
  var toastTimer;
  function toast(title, msg, tipo) {
    tipo = tipo || "ok";
    var el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.setAttribute("role", "status");
      el.innerHTML = '<span class="ic"></span><div><b></b><span class="msg-txt"></span></div>';
      document.body.appendChild(el);
    }
    el.className = "toast toast--" + tipo;
    var iconos = { ok: icon("check"), error: icon("alert"), info: icon("info") };
    el.querySelector(".ic").innerHTML = iconos[tipo] || iconos.ok;
    el.querySelector("b").textContent = title;
    el.querySelector(".msg-txt").textContent = msg || "";
    void el.offsetWidth;
    requestAnimationFrame(function () { el.classList.add("is-visible"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("is-visible"); }, 4800);
  }

  /* ------------------------------------------------------------------------
     Navegación: sticky, menú móvil
  ------------------------------------------------------------------------ */
  function initNav() {
    var header = document.querySelector(".site-header");
    var onScroll = function () {
      if (window.scrollY > 8) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var menu = document.querySelector(".mobile-menu");
    var toggle = document.querySelector(".nav .nav-toggle");
    var closeBtn = document.querySelector(".mobile-menu .nav-toggle");

    function open() {
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      toggle.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }
    function close() {
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }

    if (toggle) toggle.addEventListener("click", function () {
      menu.classList.contains("is-open") ? close() : open();
    });
    if (closeBtn) closeBtn.addEventListener("click", close);
    menu.addEventListener("click", function (e) {
      var salir = e.target.closest ? e.target.closest("[data-mobile-logout]") : null;
      if (salir) { close(); cerrarSesion(); return; }
      if (e.target === menu || (e.target.closest && e.target.closest("a"))) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  }

  /* ------------------------------------------------------------------------
     Reveal on scroll (IntersectionObserver)
  ------------------------------------------------------------------------ */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------------
     Acordeón FAQ
  ------------------------------------------------------------------------ */
  function initFaq() {
    document.querySelectorAll(".faq__q").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".faq__item");
        var answer = item.querySelector(".faq__a");
        var isOpen = item.classList.contains("is-open");
        document.querySelectorAll(".faq__item.is-open").forEach(function (open) {
          open.classList.remove("is-open");
          open.querySelector(".faq__a").style.maxHeight = null;
        });
        if (!isOpen) {
          item.classList.add("is-open");
          answer.style.maxHeight = answer.scrollHeight + "px";
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     Pestañas
  ------------------------------------------------------------------------ */
  function initTabs() {
    document.querySelectorAll("[data-tabs]").forEach(function (group) {
      var tabs = group.querySelectorAll(".tab");
      var panels = group.querySelectorAll(".tab-panel");
      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          var target = tab.getAttribute("data-tab");
          tabs.forEach(function (t) { t.classList.remove("is-active"); });
          panels.forEach(function (p) { p.classList.remove("is-active"); });
          tab.classList.add("is-active");
          group.querySelector('[data-panel="' + target + '"]').classList.add("is-active");
        });
      });
    });
  }

  /* ------------------------------------------------------------------------
     Consulta rápida (cédula / contrato) — simulación determinística
  ------------------------------------------------------------------------ */
  function initConsult() {
    var form = document.querySelector("[data-consult]");
    if (!form || !window.SucreApi) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector("input");
      var val = (input.value || "").trim();
      var result = form.querySelector(".consult__result");
      var error = form.querySelector(".field");

      if (!val) {
        if (error) error.classList.add("has-error");
        if (result) result.classList.remove("is-visible");
        return;
      }
      if (error) error.classList.remove("has-error");
      if (result) result.classList.remove("is-visible");

      var submitBtn = form.querySelector("button[type='submit']");
      var orig = submitBtn ? submitBtn.textContent : "";
      if (submitBtn) { submitBtn.textContent = "Consultando…"; submitBtn.disabled = true; }

      window.SucreApi.consultar({ documento: val }).then(function (res) {
        if (submitBtn) { submitBtn.textContent = orig; submitBtn.disabled = false; }
        if (!result) return;
        if (res.ok && res.data) {
          result.querySelector("[data-fecha]").textContent = res.data.fecha;
          result.querySelector("[data-saldo]").textContent = res.data.estado;
          result.querySelector("[data-saldo]").className = res.data.estado === "Al día" ? "text-success" : "text-emergency";
          result.querySelector("[data-doc]").textContent = res.data.documento;
          result.classList.add("is-visible");
        } else {
          if (error) error.classList.add("has-error");
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     Formularios genéricos — confirmación demo + ticket
  ------------------------------------------------------------------------ */
  function initForms() {
    function notaDemo() { return window.SucreApi && window.SucreApi.demoMode ? (window.SucreApi.demoMode() ? " (simulación)" : "") : ""; }

    // Pedido de gas
    var pedido = document.querySelector("[data-form='pedido']");
    if (pedido && window.SucreApi) {
      pedido.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!exigirSesion("#pedir")) return;
        if (!pedido.checkValidity()) { pedido.reportValidity(); return; }
        var datos = {
          bombona: (pedido.querySelector("input[name='bombona']:checked") || {}).value || "",
          nombre: ((window.Sucre.currentUser() || {}).nombre) || "",
          cedula: ((window.Sucre.currentUser() || {}).cedula) || "",
          telefono: ((window.Sucre.currentUser() || {}).telefono) || "",
          municipio: (pedido.querySelector("#p-mun") || {}).value || "",
          direccion: (pedido.querySelector("#p-dir") || {}).value || "",
          nota: (pedido.querySelector("#p-nota") || {}).value || ""
        };
        window.SucreApi.pedido(datos).then(function (res) {
          if (!res.ok) { toast("No se pudo registrar el pedido", res.error || "Inténtalo de nuevo.", "error"); return; }
          var nro = res.data.numero;
          var box = document.querySelector("[data-pedido-box]");
          if (box) {
            var num = box.querySelector("[data-pedido-num]");
            if (num) num.textContent = nro;
            box.classList.add("is-visible");
            box.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
          toast("Pedido registrado", "Número de pedido " + nro + notaDemo() + ".");
          pedido.reset();
        });
      });
    }

    // Copiar número al portapapeles (pedido o ticket)
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-copy]");
      if (!btn) return;
      var target = document.querySelector(btn.getAttribute("data-target"));
      if (!target || !target.textContent || target.textContent === "—") return;
      var text = target.textContent.trim();
      var done = function () {
        btn.textContent = "Copiado";
        setTimeout(function () { btn.textContent = "Copiar"; }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(done);
      } else {
        done();
      }
    });

    // PQR
    var pqr = document.querySelector("[data-form='pqr']");
    if (pqr && window.SucreApi) {
      pqr.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!exigirSesion("#pqr")) return;
        if (!pqr.checkValidity()) { pqr.reportValidity(); return; }
        var u = window.Sucre.currentUser() || {};
        var datos = {
          nombre: u.nombre || "",
          cedula: u.cedula || "",
          telefono: u.telefono || "",
          tipo: (pqr.querySelector("#q-tipo") || {}).value || "",
          mensaje: (pqr.querySelector("#q-msg") || {}).value || ""
        };
        window.SucreApi.pqr(datos).then(function (res) {
          if (!res.ok) { toast("No se pudo registrar el reclamo", res.error || "Inténtalo de nuevo.", "error"); return; }
          var ticket = res.data.ticket;
          var out = document.querySelector("[data-ticket]");
          if (out) { out.textContent = ticket; out.closest(".ticket-box").classList.add("is-visible"); }
          toast("Reclamo registrado", "Tu ticket " + ticket + " fue creado" + notaDemo() + ".");
          pqr.reset();
        });
      });
    }
  }

  /* ------------------------------------------------------------------------
     Pago en línea — verificación simulada en tiempo real
  ------------------------------------------------------------------------ */
  function initPayment() {
    var form = document.querySelector("[data-payment]");
    if (!form || !window.SucreApi) return;

    var status = document.querySelector("[data-pay-status]");
    var steps = status ? status.querySelectorAll(".pay-step") : [];

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!exigirSesion("#pagos")) return;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var metodo = form.querySelector("input[name='metodo']:checked");
      var datos = {
        metodo: metodo ? metodo.value : "",
        concepto: (form.querySelector("#pay-concepto") || {}).value || "",
        monto: (form.querySelector("#pay-monto") || {}).value || "",
        referencia: (form.querySelector("#pay-ref") || {}).value || ""
      };

      status.classList.remove("done");
      steps.forEach(function (s) { s.classList.remove("is-active", "is-done"); });
      steps[0].classList.add("is-active");

      setTimeout(function () {
        steps[0].classList.remove("is-active");
        steps[0].classList.add("is-done");
        steps[1].classList.add("is-active");
      }, 1200);

      setTimeout(function () {
        steps[1].classList.remove("is-active");
        steps[1].classList.add("is-done");
        steps[2].classList.add("is-active");
        window.SucreApi.pago(datos).then(function (res) {
          if (res.ok) {
            status.classList.add("done");
            toast("Pago verificado", "Tu pago fue confirmado. Comprobante " + (res.data.comprobante || "") + ".");
          } else {
            steps[2].classList.remove("is-active");
            toast("Pago no confirmado", res.error || "Revisa la referencia e inténtalo de nuevo.", "error");
          }
        });
      }, 2600);
    });
  }

  /* ------------------------------------------------------------------------
     Cuenta — helpers de sesión (demo con almacenamiento local)
     NOTA: en producción conectar a un backend real.
  ------------------------------------------------------------------------ */
  function getUsers() {
    try { return JSON.parse(localStorage.getItem("sucregas-users") || "[]"); } catch (e) { return []; }
  }
  function saveUsers(list) {
    try { localStorage.setItem("sucregas-users", JSON.stringify(list)); } catch (e) {}
  }
  function getSession() {
    try { return localStorage.getItem("sucregas-session") || null; } catch (e) { return null; }
  }
  function setSession(email) {
    try { localStorage.setItem("sucregas-session", email); } catch (e) {}
  }
  function clearSession() {
    try { localStorage.removeItem("sucregas-session"); } catch (e) {}
  }
  function storeSessionUser(u) {
    try {
      if (u) localStorage.setItem("sucregas-session-user", JSON.stringify(u));
      else localStorage.removeItem("sucregas-session-user");
    } catch (e) {}
  }
  function sessionUser() {
    try {
      var s = localStorage.getItem("sucregas-session-user");
      if (s) return JSON.parse(s);
    } catch (e) {}
    return null;
  }
  function currentUser() {
    var su = sessionUser();
    if (su) return su;
    var s = getSession();
    if (!s) return null;
    var users = getUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].email === s) return users[i];
    }
    return null;
  }
  function accLoginHTML() {
    return '<a class="btn btn-ghost btn-sm" href="cuenta.html">' + icon("person") + "<span>Ingresar</span></a>";
  }

  function accPanelHTML(u) {
    var iniciales = (u.nombre || "?").trim().split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase();
    return (
      '<button class="acc-btn" type="button" data-acc-toggle aria-expanded="false">' +
        '<span class="acc-avatar">' + iniciales + "</span>" +
        '<span class="acc-name">Hola, ' + (u.nombre || "").trim().split(" ")[0] + "</span>" +
        '<span class="acc-chev">' + icon("chev") + "</span>" +
      "</button>" +
      '<div class="acc-drop" data-acc-drop>' +
        '<a class="acc-drop__item" href="mi-cuenta.html">' + icon("person") + "Mi panel</a>" +
        '<a class="acc-drop__item" href="mi-cuenta.html#perfil">' + icon("shield") + "Mi perfil</a>" +
        '<a class="acc-drop__item" href="mi-cuenta.html#pedidos">' + icon("truck") + "Mis pedidos</a>" +
        '<a class="acc-drop__item" href="mi-cuenta.html#pagos">' + icon("wallet") + "Mis pagos</a>" +
        '<a class="acc-drop__item" href="mi-cuenta.html#facturas">' + icon("file") + "Mis facturas</a>" +
        '<a class="acc-drop__item" href="mi-cuenta.html#reclamos">' + icon("headset") + "Mis reclamos</a>" +
        '<a class="acc-drop__item" href="mi-cuenta.html#historial">' + icon("clock") + "Historial</a>" +
        '<button class="acc-drop__item acc-drop__item--out" type="button" data-acc-logout>Salir</button>' +
      "</div>"
    );
  }

  function cerrarSesion() {
    var api = window.SucreApi;
    var fin = function () {
      storeSessionUser(null);
      clearSession();
      updateNavAccount();
      location.href = "cuenta.html";
    };
    if (api) api.cerrar().then(fin); else fin();
  }

  function bindAccMenu() {
    var menu = document.querySelector("[data-acc-menu]");
    if (!menu) return;
    var toggle = menu.querySelector("[data-acc-toggle]");
    var drop = menu.querySelector("[data-acc-drop]");
    if (toggle && drop) {
      toggle.addEventListener("click", function (e) {
        e.stopPropagation();
        var abierto = drop.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", abierto ? "true" : "false");
      });
      document.addEventListener("click", function () {
        if (drop.classList.contains("is-open")) {
          drop.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && drop.classList.contains("is-open")) {
          drop.classList.remove("is-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }
    var salir = menu.querySelector("[data-acc-logout]");
    if (salir) salir.addEventListener("click", cerrarSesion);
  }

  function mobileLoginHTML() {
    return '<a class="btn btn-ghost btn-block" href="cuenta.html">' + icon("person") + '<span data-account-label>Ingresar</span></a>';
  }
  function mobileAccHTML(u) {
    var iniciales = (u.nombre || "?").trim().split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase();
    return (
      '<div class="mobile-menu__user">' +
        '<span class="acc-avatar" style="width:38px;height:38px;font-size:14px">' + iniciales + "</span>" +
        "<div><b>Hola, " + (u.nombre || "").trim().split(" ")[0] + "</b><span>" + (u.email || "") + "</span></div>" +
      "</div>" +
      '<a class="btn btn-primary btn-block" href="mi-cuenta.html">' + icon("person") + "<span>Mi panel</span></a>" +
      '<a class="btn btn-ghost btn-block" href="mi-cuenta.html#pedidos">' + icon("truck") + "<span>Mis pedidos</span></a>" +
      '<a class="btn btn-ghost btn-block" href="mi-cuenta.html#pagos">' + icon("wallet") + "<span>Mis pagos</span></a>" +
      '<a class="btn btn-ghost btn-block" href="mi-cuenta.html#facturas">' + icon("file") + "<span>Mis facturas</span></a>" +
      '<a class="btn btn-ghost btn-block" href="mi-cuenta.html#reclamos">' + icon("headset") + "<span>Mis reclamos</span></a>" +
      '<button class="btn btn-ghost btn-block" type="button" data-mobile-logout>Salir</button>'
    );
  }

  function updateNavAccount() {
    var u = currentUser();
    var menu = document.querySelector("[data-acc-menu]");
    if (menu) {
      menu.innerHTML = u ? accPanelHTML(u) : accLoginHTML();
      bindAccMenu();
    }
    var macc = document.querySelector("[data-mobile-acc]");
    if (macc) macc.innerHTML = u ? mobileAccHTML(u) : mobileLoginHTML();
    var label = u ? "Hola, " + u.nombre.trim().split(" ")[0] : "Ingresar";
    document.querySelectorAll("[data-account-label]").forEach(function (el) { el.textContent = label; });
  }

  window.Sucre = {
    getUsers: getUsers,
    saveUsers: saveUsers,
    setSession: setSession,
    clearSession: clearSession,
    currentUser: currentUser,
    sessionUser: sessionUser,
    storeSessionUser: storeSessionUser,
    refreshNav: updateNavAccount
  };

  /* ------------------------------------------------------------------------
     Control de sesión para acciones que requieren cuenta
  ------------------------------------------------------------------------ */
  function haySesion() {
    return !!(window.Sucre && window.Sucre.currentUser && window.Sucre.currentUser());
  }
  function esSPA() {
    return !!document.querySelector(".page");
  }
  function volverA(ancla) {
    if (esSPA()) return (location.hash && location.hash.length > 1) ? location.hash : "#inicio";
    var pagina = location.pathname.split("/").pop() || "index.html";
    return pagina + (ancla || location.hash || "");
  }
  function urlLogin(ancla) {
    if (esSPA()) {
      try { sessionStorage.setItem("sucregas-next", volverA(ancla)); } catch (e) {}
      return "#cuenta";
    }
    return "cuenta.html?next=" + encodeURIComponent(volverA(ancla));
  }
  function exigirSesion(ancla) {
    if (haySesion()) return true;
    location.href = urlLogin(ancla);
    return false;
  }
  function notaSesion(sel, ancla, texto) {
    if (haySesion() || !window.Sucre) return;
    var el = document.querySelector(sel);
    if (!el) return;
    var prev = el.previousElementSibling;
    if (prev && prev.classList && prev.classList.contains("login-note")) return;
    var div = document.createElement("div");
    div.className = "login-note";
    var p = document.createElement("p");
    p.textContent = texto || "Inicia sesión o crea tu cuenta para continuar.";
    var a = document.createElement("a");
    a.className = "btn btn-primary btn-sm";
    a.href = urlLogin(ancla);
    a.textContent = "Iniciar sesión";
    div.appendChild(p);
    div.appendChild(a);
    el.parentNode.insertBefore(div, el);
  }
  function initNotasSesion() {
    notaSesion("[data-form='pedido']", "#pedir", "Inicia sesión o crea tu cuenta para registrar tu pedido de gas.");
    notaSesion("[data-payment]", "#pagos", "Inicia sesión o crea tu cuenta para registrar y verificar tu pago.");
    notaSesion("[data-form='pqr']", "#pqr", "Inicia sesión o crea tu cuenta para registrar tu queja o reclamo y darle seguimiento.");
  }

  /* ------------------------------------------------------------------------
     Mascota "Fuego" — llama interactiva que habla
  ------------------------------------------------------------------------ */

  var FUEGO_FRASES = [
    "¿Quieres pedir gas? Ve a Servicios y completa el formulario de recarga Express.",
    "Recuerda revisar la manguera y la válvula antes de encender la estufa.",
    "Guarda tu bombona en posición vertical y en un lugar ventilado.",
    "Puedes pagar con Pago Móvil o transferencia en Comercios / Express.",
    "¿Hueles a gas? Comunícate con el Centro de Atención Directa: 0800-000-0000.",
    "El ciclo estadal de distribución promedia 42 días.",
    "El gas llega por sectores. Revisa el cronograma de tu municipio.",
    "¡Energía que mueve a Sucre! Yo cuido tu cocina."
  ];

  var FUEGO_BIENVENIDA = {
    inicio: "¡Hola! Soy Fuego, la llama de SucreGas. ¿En qué te ayudo hoy?",
    servicios: "¡Hola! Aquí puedes pedir tu bombona de 10, 18, 27 o 43 kg con la recarga Express.",
    oficina: "¡Hola! Paga tu gas en línea con Pago Móvil o transferencia en Comercios / Express.",
    rutas: "¡Hola! Revisa el cronograma para saber cuándo llega el gas a tu sector.",
    atencion: "¡Hola! Bienvenido al Centro de Atención Directa de SucreGas. ¿En qué te ayudo?",
    nosotros: "¡Hola! Soy Fuego, tu amigo del gas. ¡Energía que mueve a Sucre!"
  };

  var fuego = { typing: null, talkTimer: null, hideTimer: null, last: -1 };

  function fuegoSVG() {
    // Nuevo modelo de Fuego (imagen). Devuelve el <img> de la mascota.
    return '<img class="mascot-img" src="assets/img/mascota.png" alt="Fuego, la llama de SucreGas">';
  }

  function mascotHTML() {
    return (
      '<div class="mascot-row">' +
        '<div class="mascot-bubble" role="status" aria-live="polite"><span class="bubble-text"></span><span class="caret"></span></div>' +
        '<div class="mascot-col">' +
          '<button class="mascot-btn" type="button" aria-label="Hablar con Fuego, la llama de SucreGas"><span class="mascot-fig">' + fuegoSVG() + "</span></button>" +
          '<span class="mascot-tag">Fuego</span>' +
        "</div>" +
      "</div>"
    );
  }

  function fuegoSay(text) {
    var host = document.querySelector(".mascot");
    if (!host) return;
    var bubble = host.querySelector(".mascot-bubble");
    var txt = host.querySelector(".bubble-text");
    var svgs = Array.prototype.slice.call(document.querySelectorAll(".mascot-img"));

    clearTimeout(fuego.hideTimer);
    clearInterval(fuego.typing);
    clearTimeout(fuego.talkTimer);
    svgs.forEach(function (s) { s.classList.remove("is-talking"); });

    bubble.classList.add("is-show");
    txt.textContent = "";
    svgs.forEach(function (s) { s.classList.add("is-talking"); });

    var i = 0;
    fuego.typing = setInterval(function () {
      i++;
      txt.textContent = text.slice(0, i);
      if (i >= text.length) {
        clearInterval(fuego.typing);
        fuego.hideTimer = setTimeout(function () {
          bubble.classList.remove("is-show");
        }, Math.max(4200, text.length * 55));
      }
    }, 18);

    fuego.talkTimer = setTimeout(function () {
      svgs.forEach(function (s) { s.classList.remove("is-talking"); });
    }, Math.min(15000, 900 + text.length * 70));
  }

  function fuegoRandom() {
    var n;
    do { n = Math.floor(Math.random() * FUEGO_FRASES.length); } while (n === fuego.last);
    fuego.last = n;
    return FUEGO_FRASES[n];
  }

  /* ------------------------------------------------------------------------
     Chat con Fuego — base de conocimiento (motor local por palabras clave)
  ------------------------------------------------------------------------ */
  var FUEGO_SABE = [
    { id: "pedir", c: ["pedir gas", "pedido", "pedir", "pedir bombona", "pedir bomba", "bombona", "bombonas", "cilindro", "cilindros", "recarga", "recargar", "recargue", "recarga express", "express", "comprar", "comprar gas", "domicilio", "a domicilio", "entrega", "gas domestico", "gas doméstico", "llenar", "cocina", "quiero gas", "necesito gas", "tengo que pedir", "como pido"], r: "¡Claro! Pedir tu bombona es muy fácil:\n1. Entra a la sección Servicios.\n2. Elige la presentación: 10, 18, 27 o 43 kg.\n3. Completa el formulario de recarga Express.\n4. Confirma y te avisamos la fecha según tu sector.", href: "servicios.html#pedir", btn: "Ir a pedir gas" },
    { id: "tarifas", c: ["precio", "precios", "tarifa", "tarifas", "costo", "costos", "cuanto cuesta", "cuanto vale", "cuanto cuestan", "cuanto cuesta una", "valor", "barato", "caro", "cuesta", "vale", "cuanto", "monto", "montos"], r: "Tarifas referenciales:\n• Residencial: 10 kg 1,30 $ · 18 kg 2,30 $ · 27 kg 3,70 $ · 43 kg 4,90 $.\n• Atención Directa: 10 kg 3,30 $ · 18 kg 5,80 $ · 27 kg 8,60 $ · 43 kg 11,50 $.\n• Granel Residencial e Instituciones: 1 litro 0,08 $.\nLos montos en Bolívares se calculan a la tasa establecida por el BCV.", href: "servicios.html#tarifas", btn: "Ver tarifas" },
    { id: "rutas", c: ["cuando llega", "cuándo llega", "cuando toca", "cuándo toca", "cronograma", "calendario", "mi sector", "mi zona", "mi municipio", "municipio", "municipios", "parroquia", "zona", "ruta", "rutas", "distribucion", "distribución", "jornada", "llenado", "clap", "hora", "toque", "toca", "semana", "cada cuanto", "cada cuánto", "reparto", "despacho", "ciclo", "ciclo estadal", "42"], r: "El despacho se organiza por municipios, parroquias y CLAP con un cronograma semanal. El ciclo estadal de distribución promedia 42 días.\nRevisa en Rutas y Distribución el día que le toca a tu zona.", href: "rutas.html#cronograma", btn: "Ver cronograma" },
    { id: "pagos", c: ["pagar", "pago", "paga", "pagas", "pago movil", "pago móvil", "transferencia", "banco", "comercios", "comercios / express", "express", "comprobante", "recibo", "factura", "cancelar", "en linea", "en línea", "como pago", "cómo pago", "pay", "puedo pagar"], r: "Puedes pagar sin salir de casa:\n1. Entra a Comercios / Express.\n2. Elige Pago Móvil o transferencia.\n3. Indica el concepto y el monto.\n4. Escribe tu referencia y confirma.\n5. Descarga tu comprobante digital.", href: "oficina-virtual.html", btn: "Comercios / Express" },
    { id: "pqr", c: ["queja", "quejas", "reclamo", "reclamos", "pqr", "ticket", "denuncia", "sugerencia", "problema con", "no me entregaron", "no llego", "no llegó", "insatisfecho", "molestia", "reclamar", "cobro indebido", "cobros indebidos", "irregularidad", "irregularidades"], r: "Puedo ayudarte a reportarlo. Registra tu queja, reclamo o irregularidad en el sistema PQR y recibirás un número de ticket para darle seguimiento.", href: "atencion.html#pqr", btn: "Ir a PQR" },
    { id: "fuga", c: ["fuga", "fugas", "emergencia", "emergencias", "olor a gas", "huele a gas", "huele", "huelo", "riesgo", "accidente", "explosion", "explosión", "peligro", "se escapa", "grita", "preocupado", "que hago"], r: "Importante, si hueles a gas:\n1. No enciendas nada (ni luces ni aparatos).\n2. Abre puertas y ventanas.\n3. Sal del lugar.\n4. Comunícate YA con el Centro de Atención Directa: 0800-000-0000 (24 horas).", href: "atencion.html#emergencias", btn: "Centro de Atención" },
    { id: "cuenta", c: ["mi cuenta", "registrarme", "registro", "registrar", "crear cuenta", "ingresar", "iniciar sesion", "login", "loguearme", "usuario", "clave", "contraseña", "contrasena", "olvide", "olvidé", "recuperar", "crear", "cuenta"], r: "Puedes crearte una cuenta o iniciar sesión en Mi Cuenta.\nSi olvidaste la contraseña, entra a 'Recuperar' y te enviaremos un enlace a tu Gmail.", href: "cuenta.html", btn: "Ir a Mi Cuenta" },
    { id: "contacto", c: ["contacto", "telefono", "teléfono", "ubicacion", "ubicación", "direccion", "dirección", "donde estan", "dónde están", "donde queda", "sede", "correo", "email", "whatsapp", "horario", "cumaná", "donde", "maragüey"], r: "Nuestra sede está en la Av. Perimetral Cacique Maragüey, Cumaná.\nTeléfono: (0293) 000-0000 · Centro de Atención Directa: 0800-000-0000.\nAtención de lunes a sábado, y centro de atención 24 horas.", href: "nosotros.html#contacto", btn: "Ver contacto" },
    { id: "comercial", c: ["comercial", "restaurante", "restaurantes", "negocio", "negocios", "local", "panadería", "panaderia", "hotel", "hoteles", "comercio", "comercios", "alto rendimiento"], r: "Sector comercial: soluciones energéticas confiables y de alto rendimiento para restaurantes, panaderías, hoteles y negocios en general. Proveemos el volumen y la constancia de gas que necesitas para tu operatividad.", href: "servicios.html#comercial", btn: "Ver Comercial" },
    { id: "granel", c: ["granel", "granel residencial", "tuberia", "tubería", "tanque", "tanque estacionario", "cisterna", "edificio", "edificios", "condominio", "condominios", "urbanismo", "urbanismos", "instalacion", "instalación", "mantenimiento", "litro", "por litro"], r: "Granel Residencial: distribución y recarga de GLP a granel para edificios, urbanismos y complejos residenciales con tanques estacionarios. Garantizamos un suministro continuo, seguro y automatizado. La tarifa referencial es 0,08 $ por litro.", href: "servicios.html#granel-residencial", btn: "Ver Granel Residencial" },
    { id: "institucional", c: ["institucional", "instituciones", "escuela", "escuelas", "colegio", "liceo", "hospital", "hospitales", "clinica", "clínica", "ambulatorio", "comedor", "comedores", "dependencia", "dependencias", "servicios esenciales"], r: "Programa Institucional: abastecimiento prioritario y estratégico para centros de salud, instituciones educativas, comedores populares y dependencias públicas, para garantizar el funcionamiento ininterrumpido de los servicios sociales esenciales.", href: "servicios.html#institucional", btn: "Ver Institucional" },
    { id: "comunidades", c: ["comunidad", "comunidades", "sector", "sectores", "clap", "poder popular", "comunal", "consejo comunal", "bombonas", "cilindros"], r: "En las comunidades llevamos cilindros de 10 kg, 18 kg, 27 kg y 43 kg mediante una logística organizada junto al poder popular y los CLAP, para el abastecimiento directo en los sectores del estado Sucre.", href: "servicios.html#comunidades", btn: "Ver Comunidades" },
    { id: "atencion-directa", c: ["atencion directa", "asesoria", "casos prioritarios", "solicitudes especiales", "requerimiento", "requerimientos", "prioritario", "prioritaria", "gestion personalizada"], r: "Atención Directa: canales y mecanismos de gestión personalizados para dar respuesta oportuna a solicitudes especiales, casos prioritarios o requerimientos puntuales, optimizando los tiempos de respuesta.", href: "servicios.html#atencion-directa", btn: "Ver Atención Directa" },
    { id: "centro-atencion", c: ["centro de atencion", "hablar con alguien", "hablar con un asesor", "asesor", "atencion al ciudadano", "telefono de atencion", "linea de atencion", "donde reporto", "donde reclamo", "iniciar gestion"], r: "El Centro de Atención Directa SucreGas es tu espacio único para gestionar requerimientos, aclarar dudas y canalizar solicitudes o reportes.\nTeléfono: 0800-000-0000 (24 horas).\nTambién puedes usar el formulario PQR para dejar seguimiento con ticket.", href: "atencion.html", btn: "Ir al Centro de Atención" },
    { id: "empresa", c: ["ustedes", "sucregas", "sucre", "que es sucregas", "quienes son", "quiénes son", "que hacen", "qué hacen", "a que se dedican", "informacion", "información", "empresa de gas", "glp", "gas licuado", "historia"], r: "Somos SucreGas, la empresa que distribuye Gas Licuado de Petróleo (GLP) en el Estado Sucre: comunidades, granel residencial, comercios, instituciones e industrias. Cubrimos los 15 municipios del estado. ¡Energía que mueve a Sucre!" },
    { id: "servicios", c: ["servicios", "tipos de servicio", "que servicios", "qué servicios", "ofrecen", "suministro"], r: "Ofrecemos cinco líneas de servicio:\n1. Comunidades (cilindros 10, 18, 27 y 43 kg).\n2. Granel Residencial (edificios y urbanismos).\n3. Comercial (restaurantes, panaderías, hoteles y negocios).\n4. Institucional (salud, educación y dependencias públicas).\n5. Atención Directa (casos prioritarios y solicitudes especiales).", href: "servicios.html#comunidades", btn: "Ver servicios" },
    { id: "fuego", c: ["mascota", "fuego", "quien eres", "quién eres", "como te llamas", "cómo te llamas", "tu nombre", "eres", "que eres"], r: "Soy Fuego, la llama mascota de SucreGas. Te ayudo con dudas sobre pedidos, tarifas, servicios, pagos, cronograma y seguridad del gas. ¿En qué te ayudo?" }
  ];

  var FUEGO_CHIPS = [
    "¿Cómo pedir gas?", "Tarifas y precios", "¿Cuándo llega a mi zona?", "¿Cómo pago?",
    "Comunidades", "Granel Residencial", "Institucional", "Atención Directa",
    "Reportar fuga", "Dame un consejo"
  ];

  function fuegoNormalizar(t) {
    return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  }

  var fuegoSaludos = [
    "¡Hola! Soy Fuego, tu asistente de SucreGas. Pregúntame sobre pedidos, precios, cronograma, pagos o emergencias.",
    "¡Buenas! Aquí estoy para ayudarte. ¿Qué necesitas hoy? Te cuento sobre pedidos, pagos, rutas o seguridad.",
    "¡Hola, qué gusto verte! Cuéntame, ¿en qué te ayudo con tu gas?"
  ];

  function fuegoGuardarNoEntendido(pregunta) {
    try {
      var lista = JSON.parse(localStorage.getItem("sucregas-fuego-nose") || "[]");
      lista.push({ p: pregunta, f: new Date().toISOString() });
      if (lista.length > 40) lista.splice(0, lista.length - 40);
      localStorage.setItem("sucregas-fuego-nose", JSON.stringify(lista));
    } catch (e) {}
  }

  function fuegoResponder(pregunta) {
    var q = fuegoNormalizar(pregunta);

    // Saludos (rotan para no repetir)
    if (q.length < 40 && /(^hola|buenas|buen dia|saludos|^hey|que tal)/.test(q)) {
      fuego.gindex = (fuego.gindex || 0) + 1;
      return { r: fuegoSaludos[fuego.gindex % fuegoSaludos.length] };
    }
    if (q.length < 22 && /(gracias|genial|excelente|perfecto|ok|vale|super|maravilloso)/.test(q)) {
      return { r: "¡Con gusto! Estoy aquí para eso. ¿Necesitas algo más?" };
    }
    if (q.length < 22 && /(adios|adios|chao|hasta luego|nos vemos|bye)/.test(q)) {
      return { r: "¡Hasta luego! Cuida tu cocina y revisa siempre la manguera y la válvula." };
    }
    if (/(consejo|tip|recomienda|recomendacion|recomendación)/.test(q)) {
      return { r: fuegoRandom() };
    }

    function fuegoPorId(id) {
      for (var z = 0; z < FUEGO_SABE.length; z++) if (FUEGO_SABE[z].id === id) return FUEGO_SABE[z];
      return null;
    }

    // Intenciones con prioridad
    if (/(tarda|demora|tiempo de espera|ciclo estadal|42)/.test(q)) {
      var tRutas = fuegoPorId("rutas");
      if (tRutas) return { r: tRutas.r, href: tRutas.href, btn: tRutas.btn };
    }
    if (/(precio|precios|tarifa|tarifas|cuesta|vale|costo|costos|monto|valor|cuanto)/.test(q)) {
      var tTar = fuegoPorId("tarifas");
      if (tTar) return { r: tTar.r, href: tTar.href, btn: tTar.btn };
    }

    // Puntuación por palabras clave
    var mejor = null;
    var mejorN = 0;
    FUEGO_SABE.forEach(function (t) {
      var n = 0;
      t.c.forEach(function (k) { if (q.indexOf(k) > -1) n++; });
      if (n > mejorN) { mejor = t; mejorN = n; }
    });

    // Si fue una pregunta corta de seguimiento, retomar el tema anterior
    if (!mejor && fuego.ultimoTema) {
      var sigue = /(cuanto|cual|qué|que mas|que más|otra|otro|y como|entonces|despues|después|a ver|dime|explica|mas)/.test(q);
      if ((sigue || q.length < 26) && !/(chao|gracias)/.test(q)) {
        for (var i = 0; i < FUEGO_SABE.length; i++) {
          if (FUEGO_SABE[i].id === fuego.ultimoTema) {
            return { r: FUEGO_SABE[i].r, href: FUEGO_SABE[i].href, btn: FUEGO_SABE[i].btn };
          }
        }
      }
    }

    if (mejor) {
      fuego.ultimoTema = mejor.id;
      return { r: mejor.r, href: mejor.href, btn: mejor.btn };
    }

    fuegoGuardarNoEntendido(pregunta);
    fuego.ultimoTema = null;
    return { r: "Hmm, aún no sé responder eso con seguridad. Para casos así, si necesitas atención de una persona escríbenos a contacto@sucregas.gob.ve o llama al (0293) 000-0000.\nMientras tanto, puedo ayudarte con: pedir gas, precios, cronograma, pagos, reclamos, emergencias o tu cuenta. Toca una opción aquí abajo." };
  }

  function chatHTML() {
    return (
      '<div class="fuego-chat" data-fuego-chat aria-hidden="true" role="dialog" aria-label="Chat con Fuego">' +
        '<div class="fuego-chat__head">' +
          '<img class="fuego-chat__face" src="assets/img/mascota.png" alt="Fuego">' +
          '<div class="fuego-chat__id"><b>Fuego</b><span>Asistente de SucreGas · en línea</span></div>' +
          '<button class="fuego-chat__close" type="button" data-fuego-close aria-label="Cerrar chat">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
          "</button>" +
        "</div>" +
        '<div class="fuego-chat__body" data-fuego-msgs></div>' +
        '<div class="fuego-chat__chips" data-fuego-chips></div>' +
        '<div class="fuego-chat__input">' +
          '<input type="text" data-fuego-input placeholder="Escribe tu pregunta…" aria-label="Escribe tu pregunta a Fuego">' +
          '<button class="fuego-chat__send" type="button" data-fuego-send aria-label="Enviar">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h14"/><path d="m13 6 6 6-6 6"/></svg>' +
          "</button>" +
        "</div>" +
      "</div>"
    );
  }

  function initFuegoChat(host) {
    var chat = host.querySelector("[data-fuego-chat]");
    var msgs = host.querySelector("[data-fuego-msgs]");
    var chipsWrap = host.querySelector("[data-fuego-chips]");
    var input = host.querySelector("[data-fuego-input]");
    var sendBtn = host.querySelector("[data-fuego-send]");
    var closeBtn = host.querySelector("[data-fuego-close]");
    var mascotBtn = host.querySelector(".mascot-btn");
    var abierto = false;
    var saludoHecho = false;

    function scrollAbajo() { msgs.scrollTop = msgs.scrollHeight; }

    function msgFuego(texto, accion, conFb) {
      var f = document.createElement("div");
      f.className = "chat-b chat-b--fuego";
      var b = document.createElement("div");
      b.className = "chat-b__bubble";
      b.textContent = texto;
      f.appendChild(b);
      if (accion && accion.href) {
        var a = document.createElement("a");
        a.className = "btn btn-primary btn-sm chat-b__act";
        a.href = accion.href;
        a.textContent = accion.btn || "Ir";
        f.appendChild(a);
      }
      if (conFb) feedbackRow(f);
      msgs.appendChild(f);
      scrollAbajo();
      return f;
    }

    function feedbackRow(f) {
      var r = document.createElement("div");
      r.className = "chat-fb";
      var si = document.createElement("button");
      si.type = "button"; si.textContent = "Sí, me sirvió";
      var no = document.createElement("button");
      no.type = "button"; no.textContent = "No me sirvió";
      var marcar = function (v) {
        try {
          var o = JSON.parse(localStorage.getItem("sucregas-fuego-util") || "{}");
          o[v] = (o[v] || 0) + 1;
          localStorage.setItem("sucregas-fuego-util", JSON.stringify(o));
        } catch (e) {}
        r.innerHTML = "";
        var g = document.createElement("span");
        g.className = "chat-fb__ok";
        g.textContent = "¡Gracias por tu opinión!";
        r.appendChild(g);
      };
      si.addEventListener("click", function () { marcar("si"); });
      no.addEventListener("click", function () { marcar("no"); });
      r.appendChild(si);
      r.appendChild(no);
      f.appendChild(r);
    }

    function msgUser(texto) {
      var u = document.createElement("div");
      u.className = "chat-b chat-b--user";
      var b = document.createElement("div");
      b.className = "chat-b__bubble";
      b.textContent = texto;
      u.appendChild(b);
      msgs.appendChild(u);
      scrollAbajo();
    }

    function typingFuego() {
      var t = document.createElement("div");
      t.className = "chat-b chat-b--fuego is-typing";
      t.innerHTML = '<div class="chat-b__bubble chat-b__dots"><span></span><span></span><span></span></div>';
      msgs.appendChild(t);
      scrollAbajo();
      return t;
    }

    function enviar(texto) {
      texto = (texto || "").trim();
      if (!texto) return;
      msgUser(texto);
      input.value = "";
      var tip = typingFuego();
      var img = host.querySelector(".mascot-btn .mascot-img");
      if (img) img.classList.add("is-talking");
      var espera = 650 + Math.min(1400, texto.length * 14) + Math.random() * 400;
      setTimeout(function () {
        tip.remove();
        if (img) img.classList.remove("is-talking");
        var r = fuegoResponder(texto);
        msgFuego(r.r, r, true);
      }, espera);
    }

    function abrir() {
      abierto = true;
      host.classList.add("is-chatting");
      chat.classList.add("is-open");
      chat.setAttribute("aria-hidden", "false");
      if (mascotBtn) mascotBtn.setAttribute("aria-label", "Cerrar chat con Fuego");
      if (chipsWrap && !chipsWrap.children.length) {
        FUEGO_CHIPS.forEach(function (t) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "fuego-chip";
          b.textContent = t;
          b.addEventListener("click", function () { enviar(t); });
          chipsWrap.appendChild(b);
        });
      }
      if (!saludoHecho) {
        saludoHecho = true;
        setTimeout(function () {
          msgFuego("¡Hola! Soy Fuego, el asistente automático de SucreGas. Pregúntame con confianza o toca una opción. (Para emergencias, comunícate con el Centro de Atención Directa: 0800-000-0000).");
        }, 250);
      }
      setTimeout(function () { if (input) input.focus(); }, 250);
    }
    function cerrar() {
      abierto = false;
      host.classList.remove("is-chatting");
      chat.classList.remove("is-open");
      chat.setAttribute("aria-hidden", "true");
      if (mascotBtn) mascotBtn.setAttribute("aria-label", "Hablar con Fuego, la llama de SucreGas");
    }

    if (mascotBtn) {
      mascotBtn.addEventListener("click", function () { abierto ? cerrar() : abrir(); });
      mascotBtn.addEventListener("mouseenter", function () {
        if (abierto) return;
        var bubble = host.querySelector(".mascot-bubble");
        if (bubble && bubble.classList.contains("is-show")) return;
        fuegoSay(fuegoRandom());
      });
    }
    if (closeBtn) closeBtn.addEventListener("click", cerrar);
    if (sendBtn) sendBtn.addEventListener("click", function () { enviar(input.value); });
    if (input) {
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); enviar(input.value); }
      });
    }
  }

  function initFuego() {
    // Rellenar contenedores de la llama (sección "Conoce a Fuego")
    Array.prototype.slice.call(document.querySelectorAll("[data-llama]")).forEach(function (slot) {
      slot.innerHTML = fuegoSVG();
      slot.addEventListener("click", function () { fuegoSay(fuegoRandom()); });
    });

    // Crear widget flotante
    var host = document.querySelector(".mascot");
    if (!host) {
      host = document.createElement("div");
      host.className = "mascot";
      document.body.appendChild(host);
    }
    host.innerHTML = mascotHTML();
    host.insertAdjacentHTML("beforeend", chatHTML());
    initFuegoChat(host);

    // Botones "Hablar con Fuego" de la página (globo de consejos)
    Array.prototype.slice.call(document.querySelectorAll("[data-fuego-speak]")).forEach(function (b) {
      b.addEventListener("click", function () {
        fuegoSay(b.getAttribute("data-phrase") || fuegoRandom());
      });
    });

    // Parpadeo aleatorio
    setInterval(function () {
      Array.prototype.slice.call(document.querySelectorAll(".mascot-img")).forEach(function (s) {
        s.classList.add("blink");
        setTimeout(function () { s.classList.remove("blink"); }, 160);
      });
    }, 2600 + Math.random() * 2600);

    // Bienvenida al cargar la página
    var welcome = FUEGO_BIENVENIDA[page] || FUEGO_BIENVENIDA.inicio;
    setTimeout(function () { fuegoSay(welcome); }, 1600);
  }

  /* ------------------------------------------------------------------------
     Carrusel de banners
  ------------------------------------------------------------------------ */
  function initSlider() {
    var root = document.querySelector("[data-slider]");
    if (!root) return;
    var track = root.querySelector(".slider__track");
    var slides = Array.prototype.slice.call(root.querySelectorAll(".slide"));
    var dotsWrap = root.querySelector("[data-slider-dots]");
    var prevBtn = root.querySelector("[data-slider-prev]");
    var nextBtn = root.querySelector("[data-slider-next]");
    if (!track || slides.length < 2) return;

    var i = 0;
    var timer = null;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function updateDots() {
      if (!dotsWrap) return;
      Array.prototype.forEach.call(dotsWrap.children, function (d, idx) {
        d.classList.toggle("is-active", idx === i);
      });
    }
    function go(n) {
      i = (n + slides.length) % slides.length;
      track.style.transform = "translateX(-" + (i * 100) + "%)";
      updateDots();
      restart();
    }
    function prev() { go(i - 1); }
    function next() { go(i + 1); }
    function restart() {
      if (timer) clearInterval(timer);
      timer = null;
      if (reduce) return;
      timer = setInterval(next, 6000);
    }
    function pause() { if (timer) { clearInterval(timer); timer = null; } }

    if (dotsWrap) {
      slides.forEach(function (_, idx) {
        var d = document.createElement("button");
        d.type = "button";
        d.className = "slider__dot";
        d.setAttribute("aria-label", "Ir al banner " + (idx + 1));
        d.addEventListener("click", function () { go(idx); });
        dotsWrap.appendChild(d);
      });
    }
    if (prevBtn) prevBtn.addEventListener("click", prev);
    if (nextBtn) nextBtn.addEventListener("click", next);

    // Pausa al pasar el mouse o enfocar
    root.addEventListener("mouseenter", pause);
    root.addEventListener("mouseleave", restart);
    root.addEventListener("focusin", pause);
    root.addEventListener("focusout", restart);

    // Deslizamiento táctil
    var x0 = null;
    root.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; pause(); }, { passive: true });
    root.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
      else { restart(); }
    }, { passive: true });

    updateDots();
    restart();
  }

  /* ------------------------------------------------------------------------
     Aviso de cookies
  ------------------------------------------------------------------------ */
  function leerCookie(nombre) {
    var prefijo = nombre + "=";
    var partes = document.cookie.split(";");
    for (var i = 0; i < partes.length; i++) {
      var p = partes[i].trim();
      if (p.indexOf(prefijo) === 0) return decodeURIComponent(p.slice(prefijo.length));
    }
    return null;
  }
  function guardarConsentimiento(valor) {
    try { document.cookie = "sucregas_cookies=" + encodeURIComponent(valor) + ";max-age=31536000;path=/;SameSite=Lax"; } catch (e) {}
    try { localStorage.setItem("sucregas_cookies_ok", valor); } catch (e) {}
  }
  function tieneConsentimiento() {
    var c = leerCookie("sucregas_cookies");
    if (c) return c;
    try { return localStorage.getItem("sucregas_cookies_ok"); } catch (e) {}
    return null;
  }
  function initCookieBar() {
    if (tieneConsentimiento()) return;
    var bar = document.createElement("div");
    bar.className = "cookiebar";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-label", "Aviso de cookies");
    bar.innerHTML =
      '<div class="cookiebar__inner">' +
        '<p class="cookiebar__txt">Utilizamos cookies y almacenamiento local necesarios para el funcionamiento del sitio y para recordar tus preferencias. No usamos cookies de publicidad ni de terceros. Consulta nuestra <a href="cookies.html">Política de Cookies</a>.</p>' +
        '<div class="cookiebar__actions">' +
          '<button class="btn btn-ghost btn-sm" type="button" data-cookie-necesarias style="color:#fff;border-color:rgba(255,255,255,.4)">Solo necesarias</button>' +
          '<button class="btn btn-primary btn-sm" type="button" data-cookie-aceptar>Aceptar todas</button>' +
        "</div>" +
      "</div>";
    document.body.appendChild(bar);

    document.body.classList.add("has-cookiebar");
    var ajustarAlturaCookiebar = function () {
      document.documentElement.style.setProperty("--cookiebar-h", bar.offsetHeight + "px");
    };
    ajustarAlturaCookiebar();
    window.addEventListener("resize", ajustarAlturaCookiebar);

    var ocultar = function () {
      bar.classList.add("is-hidden");
      document.body.classList.remove("has-cookiebar");
      window.removeEventListener("resize", ajustarAlturaCookiebar);
      setTimeout(function () { if (bar.parentNode) bar.parentNode.removeChild(bar); }, 300);
    };
    var aceptar = bar.querySelector("[data-cookie-aceptar]");
    var necesarias = bar.querySelector("[data-cookie-necesarias]");
    if (aceptar) aceptar.addEventListener("click", function () { guardarConsentimiento("todas"); ocultar(); });
    if (necesarias) necesarias.addEventListener("click", function () { guardarConsentimiento("necesarias"); ocultar(); });
  }

  /* ------------------------------------------------------------------------
     Init
  ------------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    var headerSlot = document.querySelector("[data-header]");
    var footerSlot = document.querySelector("[data-footer]");
    if (headerSlot) headerSlot.innerHTML = headerHTML();
    if (footerSlot) footerSlot.innerHTML = footerHTML();
    if (!document.querySelector(".mobile-menu") && headerSlot) {
      var menu = document.createElement("div");
      menu.innerHTML = mobileMenuHTML();
      document.body.appendChild(menu.firstElementChild);
    }

    initNav();
    initReveal();
    initFaq();
    initTabs();
    initConsult();
    initForms();
    initPayment();
    initSlider();
    initFuego();
    initCookieBar();
    initNotasSesion();
    updateNavAccount();
  });
})();
