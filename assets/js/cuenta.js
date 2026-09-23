/* ==========================================================================
   SucreGas — Cuenta (login, registro, recuperación)
   --------------------------------------------------------------------------
   Toda la lógica de datos pasa por window.SucreApi (assets/js/api.js).
   Incluye: captcha, medidor de contraseña, "mantenerme conectado",
   verificación de correo y retorno a la acción (?next=).
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

  function param(nombre, url) {
    var m = (url || location.search).match(new RegExp("[?&]" + nombre + "=([^&]+)"));
    return m ? decodeURIComponent(m[1]) : "";
  }

  // Solo permite destinos INTERNOS (evita redirigir a sitios externos)
  function destinoSeguro(s) {
    s = (s == null ? "" : String(s)).trim();
    if (s === "") return "";
    if (s.indexOf("\\") !== -1) return "";             // evita bypass con barras invertidas
    if (s.indexOf("//") === 0) return "";               // //otro-sitio
    if (/^[a-z][a-z0-9+.-]*:/i.test(s)) return "";      // http:, https:, javascript:, etc.
    if (s.charAt(0) === "#" || s.charAt(0) === "/") return s;
    if (/^[a-z0-9._-]+\.html([?#][^\s]*)?$/i.test(s)) return s;
    return "";
  }

  function obtenerSiguiente() {
    var s = destinoSeguro(param("next"));
    if (!s) {
      try {
        s = destinoSeguro(sessionStorage.getItem("sucregas-next") || "");
        if (s) sessionStorage.removeItem("sucregas-next");
      } catch (e) { s = ""; }
    }
    return s;
  }

  function irAlPanel() {
    var sig = obtenerSiguiente();
    location.href = sig || "mi-cuenta.html";
  }

  /* ------------------------------------------------------------------------
     Utilidades
  ------------------------------------------------------------------------ */
  function showView(name) {
    $$(".auth-view").forEach(function (v) {
      v.classList.toggle("is-active", v.getAttribute("data-auth-view") === name);
    });
    $$(".auth-tabs .tab").forEach(function (t) {
      t.classList.toggle("is-active", t.getAttribute("data-auth-tab") === name);
    });
  }
  function msg(el, type, text) {
    if (!el) return;
    el.className = "msg msg--" + type + " is-show";
    el.textContent = text;
  }
  function clearMsg(el) { if (el) { el.className = "msg"; el.textContent = ""; } }
  function setError(input, on) {
    var field = input.closest(".field");
    if (field) field.classList.toggle("has-error", on);
  }
  function setBtnLoading(btn, loading, label) {
    if (!btn) return;
    if (loading) { btn.dataset.origLabel = btn.textContent; btn.textContent = "Procesando…"; btn.disabled = true; }
    else { btn.textContent = btn.dataset.origLabel || label || btn.textContent; btn.disabled = false; }
  }
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }

  function fortaleza(pass) {
    var n = 0;
    if (pass.length >= 8) n++;
    if (pass.length >= 12) n++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) n++;
    if (/\d/.test(pass)) n++;
    if (/[^A-Za-z0-9]/.test(pass)) n++;
    return Math.min(n, 4);
  }
  $$("[data-pwd-strength]").forEach(function (caja) {
    var input = caja.closest(".field").querySelector("input");
    if (!input) return;
    var bar = caja.querySelector("i");
    var txt = caja.querySelector("span");
    var colores = ["var(--red)", "#f59e0b", "#f59e0b", "var(--green)", "var(--green)"];
    var etiquetas = ["Seguridad de la contraseña", "Débil", "Aceptable", "Buena", "Fuerte"];
    input.addEventListener("input", function () {
      var f = fortaleza(input.value);
      bar.style.width = (f / 4 * 100) + "%";
      bar.style.background = colores[f];
      txt.textContent = etiquetas[f];
    });
  });

  /* ------------------------------------------------------------------------
     CAPTCHA
  ------------------------------------------------------------------------ */
  function cargarCaptcha(scope) {
    var caja = $('[data-captcha-pregunta="' + scope + '"]');
    if (!caja) return;
    caja.textContent = "Cargando…";
    api.captcha({ scope: scope }).then(function (res) {
      caja.textContent = (res.ok && res.data) ? res.data.pregunta : "No se pudo cargar la verificación";
    });
  }
  $$("[data-captcha-refresh]").forEach(function (btn) {
    btn.addEventListener("click", function () { cargarCaptcha(btn.getAttribute("data-captcha-refresh")); });
  });
  cargarCaptcha("login");
  cargarCaptcha("register");
  cargarCaptcha("recover");

  /* ------------------------------------------------------------------------
     Mostrar / ocultar contraseña y pestañas
  ------------------------------------------------------------------------ */
  $$(".pwd-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var input = btn.closest(".pwd-wrap").querySelector("input");
      var isVis = btn.classList.toggle("is-visible");
      input.type = isVis ? "text" : "password";
      btn.setAttribute("aria-label", isVis ? "Ocultar contraseña" : "Mostrar contraseña");
    });
  });
  $$(".auth-tabs .tab").forEach(function (tab) {
    tab.addEventListener("click", function () {
      showView(tab.getAttribute("data-auth-tab"));
      $$(".auth-view .msg").forEach(clearMsg);
    });
  });
  $$("[data-goto]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      showView(btn.getAttribute("data-goto"));
      $$(".auth-view .msg").forEach(clearMsg);
    });
  });

  /* ------------------------------------------------------------------------
     REGISTRO
  ------------------------------------------------------------------------ */
  var regForm = $("[data-auth-form='register']");
  if (regForm) {
    regForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var nombre = $("[name='rg-nombre']", regForm).value.trim();
      var cedula = $("[name='rg-cedula']", regForm).value.trim();
      var telefono = $("[name='rg-tel']", regForm).value.trim();
      var email = $("[name='rg-email']", regForm).value.trim().toLowerCase();
      var pass = $("[name='rg-pass']", regForm).value;
      var pass2 = $("[name='rg-pass2']", regForm).value;
      var captcha = $("[name='rg-captcha']", regForm).value;
      var m = $("[data-msg='register']");
      var btn = $("button[type='submit']", regForm);

      setError($("[name='rg-nombre']", regForm), !nombre);
      setError($("[name='rg-cedula']", regForm), !cedula);
      setError($("[name='rg-tel']", regForm), !telefono);
      setError($("[name='rg-email']", regForm), !email || !validEmail(email));
      setError($("[name='rg-pass']", regForm), pass.length < 8);
      setError($("[name='rg-pass2']", regForm), !pass2 || pass2 !== pass);
      setError($("[name='rg-captcha']", regForm), !captcha);

      if (!nombre || !cedula || !telefono || !email || !validEmail(email) || pass.length < 8 || pass2 !== pass || !captcha) {
        msg(m, "error", "Revisa los campos marcados en rojo.");
        return;
      }
      setBtnLoading(btn, true);
      api.registro({ nombre: nombre, cedula: cedula, telefono: telefono, email: email, password: pass, captcha: captcha }).then(function (res) {
        setBtnLoading(btn, false);
        if (!res.ok) {
          cargarCaptcha("register");
          msg(m, "error", res.error || "No se pudo crear la cuenta.");
          return;
        }
        if (res.data && typeof res.data === "object" && res.data.email) S.storeSessionUser(res.data);
        S.refreshNav();
        regForm.reset();
        irAlPanel();
      });
    });
  }

  /* ------------------------------------------------------------------------
     INICIAR SESIÓN
  ------------------------------------------------------------------------ */
  var loginForm = $("[data-auth-form='login']");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = $("[name='lg-email']", loginForm).value.trim().toLowerCase();
      var pass = $("[name='lg-pass']", loginForm).value;
      var captcha = $("[name='lg-captcha']", loginForm).value;
      var recordar = $("[name='lg-recordar']", loginForm).checked;
      var m = $("[data-msg='login']");
      var btn = $("button[type='submit']", loginForm);

      setError($("[name='lg-email']", loginForm), !email);
      setError($("[name='lg-pass']", loginForm), !pass);
      setError($("[name='lg-captcha']", loginForm), !captcha);
      if (!email || !pass || !captcha) { msg(m, "error", "Completa tus datos y la verificación."); return; }

      setBtnLoading(btn, true);
      api.login({ email: email, password: pass, captcha: captcha, recordar: recordar }).then(function (res) {
        setBtnLoading(btn, false);
        if (!res.ok) {
          cargarCaptcha("login");
          $("[name='lg-captcha']", loginForm).value = "";
          msg(m, "error", res.error || "Correo o contraseña incorrectos.");
          return;
        }
        if (res.data && res.data.email) S.storeSessionUser(res.data);
        S.refreshNav();
        loginForm.reset();
        irAlPanel();
      });
    });
  }

  /* ------------------------------------------------------------------------
     RECUPERAR CONTRASEÑA
  ------------------------------------------------------------------------ */
  var tokenEnlace = param("token");
  var verificarToken = param("verificar");

  if (verificarToken) {
    api.verificar({ token: verificarToken }).then(function (res) {
      var box = $("[data-msg='login']");
      showView("login");
      msg(box, res.ok ? "success" : "error", res.ok ? "Correo verificado. Ya puedes iniciar sesión." : (res.error || "El enlace es inválido o expiró."));
    });
  }

  var recoverForm = $("[data-auth-form='recover']");
  if (recoverForm) {
    recoverForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = $("[name='rc-email']", recoverForm).value.trim().toLowerCase();
      var captcha = $("[name='rc-captcha']", recoverForm).value;
      var m = $("[data-msg='recover']");
      var btn = $("button[type='submit']", recoverForm);

      setError($("[name='rc-email']", recoverForm), !email || !validEmail(email));
      setError($("[name='rc-captcha']", recoverForm), !captcha);
      if (!email || !validEmail(email) || !captcha) { msg(m, "error", "Completa el correo y la verificación."); return; }

      setBtnLoading(btn, true);
      api.recuperar({ email: email, captcha: captcha }).then(function (res) {
        setBtnLoading(btn, false);
        cargarCaptcha("recover");
        if (!res.ok) { msg(m, "error", res.error || "No se pudo enviar el enlace."); return; }
        msg(m, "success", "Si el correo está registrado, recibirás un enlace de recuperación. Revisa tu bandeja.");
      });
    });
  }

  var demoReset = $("[data-demo-reset]");
  if (demoReset) {
    if (!api.demoMode()) demoReset.style.display = "none";
    demoReset.addEventListener("click", function () {
      var email = ($("[name='rc-email']") || {}).value || "";
      email = email.trim().toLowerCase();
      if (!validEmail(email)) { msg($("[data-msg='recover']"), "error", "Primero escribe tu correo."); return; }
      if (!S.getUsers || !S.getUsers().some(function (u) { return u.email === email; })) {
        msg($("[data-msg='recover']"), "error", "No encontramos una cuenta con ese correo.");
        return;
      }
      $("[data-reset-email]").textContent = email;
      $("[data-recover-step='send']").style.display = "none";
      $("[data-recover-step='reset']").style.display = "block";
    });
  }

  if (tokenEnlace) {
    $("[data-reset-email]").textContent = "tu cuenta (enlace de recuperación)";
    $("[data-recover-step='send']").style.display = "none";
    $("[data-recover-step='reset']").style.display = "block";
    showView("recover");
  }

  var resetForm = $("[data-auth-form='reset']");
  if (resetForm) {
    resetForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var pass = $("[name='rs-pass']", resetForm).value;
      var pass2 = $("[name='rs-pass2']", resetForm).value;
      var email = ($("[data-reset-email]").textContent || "").trim().toLowerCase();
      var m = $("[data-msg='reset']");
      var btn = $("button[type='submit']", resetForm);

      setError($("[name='rs-pass']", resetForm), pass.length < 8);
      setError($("[name='rs-pass2']", resetForm), !pass2 || pass2 !== pass);
      if (pass.length < 8 || pass2 !== pass) { msg(m, "error", "Revisa los campos marcados en rojo."); return; }

      setBtnLoading(btn, true);
      var payload = tokenEnlace ? { token: tokenEnlace, password: pass } : { email: email, password: pass };
      api.restablecer(payload).then(function (res) {
        setBtnLoading(btn, false);
        if (!res.ok) { msg(m, "error", res.error || "No se pudo cambiar la contraseña."); return; }
        msg(m, "success", "Contraseña actualizada. Ya puedes iniciar sesión.");
        resetForm.reset();
        setTimeout(function () {
          showView("login");
          $("[data-recover-step='send']").style.display = "block";
          $("[data-recover-step='reset']").style.display = "none";
          msg($("[data-msg='login']"), "success", "Contraseña restablecida. Inicia sesión con tu nueva contraseña.");
        }, 1400);
      });
    });
  }

  /* ------------------------------------------------------------------------
     PANEL DE CUENTA (pantalla de sesión)
  ------------------------------------------------------------------------ */
  function renderAccount() {
    var u = S.currentUser();
    if (!u) return;
    var initials = u.nombre.trim().split(" ").map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase();
    $("[data-acc-avatar]").textContent = initials;
    $("[data-acc-nombre]").textContent = u.nombre;
    $("[data-acc-email]").textContent = u.email;
    $("[data-acc-cedula]").textContent = u.cedula || "—";
    $("[data-acc-tel]").textContent = u.telefono || "—";
  }

  var logoutBtn = $("[data-logout]");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      api.cerrar().then(function () {
        S.storeSessionUser(null);
        if (S.clearSession) S.clearSession();
        S.refreshNav();
        showView("login");
        msg($("[data-msg='login']"), "success", "Cerraste sesión. ¡Hasta pronto!");
      });
    });
  }

  if (S.currentUser()) {
    renderAccount();
    showView("account");
  }
})();
