/* ==========================================================================
   SucreGas — Capa de datos (API)
   --------------------------------------------------------------------------
   Aquí vive TODA la comunicación con datos. La página solo usa estas
   funciones (SucreApi.*) y no toca localStorage ni el servidor directo.

   CÓMO PONERLA EN PRODUCCIÓN (en el hosting del cliente):
     1) Subir la carpeta "backend" a public_html.
     2) Crear la BD MySQL en GoDaddy e importar backend/schema.sql.
     3) Editar backend/config.php con los datos de la BD.
     4) Cambiar abajo  cfg.apiBase = ""  por  cfg.apiBase = "/backend/" .
   ========================================================================== */
(function () {
  "use strict";

  // --- CONFIG: vacío = DEMO (guarda en el navegador). Real = ruta del backend.
  var cfg = {
    apiBase: "/backend/" // ruta del backend real
  };

  var S = window.Sucre || {};
  var csrf = null;
  var PUBLICAS = ["captcha", "csrf", "registro", "login", "recuperar", "restablecer", "verificar", "sesion"];

  function pedirCsrf() {
    return fetch(cfg.apiBase + "api.php?accion=csrf", { credentials: "same-origin" })
      .then(function (r) { return r.json(); })
      .then(function (j) { csrf = j && j.data ? j.data.token : null; })
      .catch(function () { csrf = null; });
  }

  function enviar(accion, datos) {
    var url = cfg.apiBase + "api.php?accion=" + encodeURIComponent(accion);
    var headers = { "Content-Type": "application/json" };
    if (csrf) headers["X-CSRF"] = csrf;
    return fetch(url, {
      method: "POST",
      headers: headers,
      credentials: "same-origin",
      body: JSON.stringify(datos || {})
    }).then(function (r) {
      return r.json().catch(function () {
        return { ok: false, error: "El servidor devolvió una respuesta no válida." };
      });
    }).catch(function () {
      return { ok: false, error: "No se pudo conectar con el servidor." };
    });
  }

  function pedir(accion, datos) {
    if (!cfg.apiBase) return Promise.resolve(demo(accion, datos || {}));
    var necesitaCsrf = PUBLICAS.indexOf(accion) === -1;
    if (accion === "cerrar" || accion === "cerrarTodas") csrf = null;
    if (necesitaCsrf && !csrf) {
      return pedirCsrf().then(function () { return enviar(accion, datos); });
    }
    return enviar(accion, datos);
  }

  /* ------------------------- Utilidades de demo ------------------------- */
  function users() { return S.getUsers ? S.getUsers() : []; }
  function save(list) { if (S.saveUsers) S.saveUsers(list); }
  function yo() { return S.currentUser ? S.currentUser() : null; }
  function guardarSesion(u) {
    if (S.storeSessionUser) S.storeSessionUser(u);
    if (u && S.setSession) S.setSession(u.email);
  }
  function lista(clave) {
    try { return JSON.parse(localStorage.getItem(clave) || "[]"); } catch (e) { return []; }
  }
  function guardarLista(clave, arr) {
    try { localStorage.setItem(clave, JSON.stringify(arr)); } catch (e) {}
  }
  function fechaHoy() {
    return new Date().toLocaleDateString("es-VE", { day: "2-digit", month: "2-digit", year: "numeric" });
  }
  function numero(ancho) {
    var n = String(Math.floor(Math.random() * Math.pow(10, ancho)));
    while (n.length < ancho) n = "0" + n;
    return n;
  }
  function captchaDemoCrear(scope) {
    var key = "sucregas-captcha-" + (scope || "general");
    var a = 2 + Math.floor(Math.random() * 8);
    var b = 2 + Math.floor(Math.random() * 8);
    try { localStorage.setItem(key, JSON.stringify({ r: a + b, exp: Date.now() + 600000 })); } catch (e) {}
    return "¿Cuánto es " + a + " + " + b + "?";
  }
  function captchaDemoValidar(resp, scope) {
    var key = "sucregas-captcha-" + (scope || "general");
    var d = null;
    try { d = JSON.parse(localStorage.getItem(key) || "null"); } catch (e) { d = null; }
    try { localStorage.removeItem(key); } catch (e) {}
    if (!d || Date.now() > d.exp) return false;
    return String(parseInt(resp, 10)) === String(d.r);
  }

  /* ------------------------------ DEMO ------------------------------ */
  function demo(accion, d) {
    var u = yo();
    switch (accion) {

      case "csrf": return { ok: true, data: { token: "demo" } };
      case "captcha": return { ok: true, data: { pregunta: captchaDemoCrear(d.scope) } };

      case "registro": {
        if (!captchaDemoValidar(d.captcha, "register")) return { ok: false, error: "Verificación incorrecta. Inténtalo de nuevo." };
        if ((d.password || "").length < 8) return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
        var listaR = users();
        for (var i = 0; i < listaR.length; i++) {
          if (listaR[i].email === d.email) return { ok: false, error: "No se pudo crear la cuenta con esos datos." };
        }
        var nuevo = { nombre: d.nombre, cedula: d.cedula, telefono: d.telefono, email: d.email, password: d.password, verificado: 0 };
        listaR.push(nuevo);
        save(listaR);
        guardarSesion({ nombre: nuevo.nombre, email: nuevo.email, cedula: nuevo.cedula, telefono: nuevo.telefono, verificado: 0 });
        return { ok: true, data: { nombre: nuevo.nombre, email: nuevo.email, cedula: nuevo.cedula, telefono: nuevo.telefono, verificado: 0 } };
      }

      case "verificar": {
        var lv = users();
        for (var v = 0; v < lv.length; v++) {
          if (lv[v].email === (u ? u.email : "")) { lv[v].verificado = 1; save(lv); if (u) u.verificado = 1; guardarSesion(u); break; }
        }
        return { ok: true, data: "Correo verificado." };
      }

      case "reenviarVerificacion": return { ok: true, data: "Te enviamos un correo de verificación (simulación)." };

      case "login": {
        if (intentosDemo(u ? u.email : d.email) >= 5) return { ok: false, error: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." };
        if (!captchaDemoValidar(d.captcha, "login")) return { ok: false, error: "Verificación incorrecta. Inténtalo de nuevo." };
        var listaL = users();
        for (var j = 0; j < listaL.length; j++) {
          if (listaL[j].email === d.email && listaL[j].password === d.password) {
            limpiarIntentos(d.email);
            var dato = { nombre: listaL[j].nombre, email: listaL[j].email, cedula: listaL[j].cedula, telefono: listaL[j].telefono, verificado: listaL[j].verificado || 0 };
            guardarSesion(dato);
            return { ok: true, data: dato };
          }
        }
        sumarIntento(d.email);
        return { ok: false, error: "Correo o contraseña incorrectos." };
      }

      case "sesion": return u ? { ok: true, data: u } : { ok: false, error: "No hay sesión." };

      case "cerrar":
        if (S.storeSessionUser) S.storeSessionUser(null);
        if (S.clearSession) S.clearSession();
        return { ok: true, data: "Sesión cerrada." };

      case "cerrarTodas": {
        var lt = users();
        for (var t = 0; t < lt.length; t++) { lt[t].recordar = false; }
        save(lt);
        return { ok: true, data: "Se cerraron todas las sesiones." };
      }

      case "recuperar": {
        if (!captchaDemoValidar(d.captcha, "recover")) return { ok: false, error: "Verificación incorrecta. Inténtalo de nuevo." };
        return { ok: true, data: "Si el correo está registrado, recibirás un enlace." };
      }

      case "restablecer": {
        if ((d.password || "").length < 8) return { ok: false, error: "La contraseña debe tener al menos 8 caracteres." };
        var listaU = users();
        for (var k = 0; k < listaU.length; k++) {
          if (listaU[k].email === d.email) {
            if (listaU[k].password === d.password) return { ok: false, error: "La nueva contraseña no puede ser igual a la anterior." };
            listaU[k].password = d.password;
            save(listaU);
            return { ok: true, data: "Contraseña actualizada." };
          }
        }
        return { ok: false, error: "No encontramos la cuenta." };
      }

      case "cambiarPassword": {
        if (!u) return { ok: false, error: "Debes iniciar sesión." };
        if ((d.nueva || "").length < 8) return { ok: false, error: "La nueva contraseña debe tener al menos 8 caracteres." };
        var lu = users();
        for (var c = 0; c < lu.length; c++) {
          if (lu[c].email === u.email) {
            if (lu[c].password !== d.actual) return { ok: false, error: "La contraseña actual no es correcta." };
            if (d.nueva === d.actual) return { ok: false, error: "La nueva contraseña no puede ser igual a la actual." };
            lu[c].password = d.nueva;
            save(lu);
            return { ok: true, data: "Contraseña actualizada." };
          }
        }
        return { ok: false, error: "No encontramos la cuenta." };
      }

      case "perfil":
        if (!u) return { ok: false, error: "Debes iniciar sesión." };
        return { ok: true, data: u };

      case "actualizarPerfil": {
        if (!u) return { ok: false, error: "Debes iniciar sesión." };
        var lp = users();
        for (var z = 0; z < lp.length; z++) {
          if (lp[z].email === u.email) {
            if (d.nombre) lp[z].nombre = d.nombre;
            if (d.telefono) lp[z].telefono = d.telefono;
            save(lp);
            var act = { nombre: lp[z].nombre, email: lp[z].email, cedula: lp[z].cedula, telefono: lp[z].telefono, verificado: lp[z].verificado || 0 };
            guardarSesion(act);
            return { ok: true, data: act };
          }
        }
        return { ok: false, error: "No encontramos la cuenta." };
      }

      case "consultar": {
        var ced = (d.cedula || d.documento || "").toString();
        var hash = 0;
        for (var m = 0; m < ced.length; m++) hash = (hash * 31 + ced.charCodeAt(m)) >>> 0;
        var dias = 1 + (hash % 6);
        var f = new Date();
        f.setDate(f.getDate() + dias);
        var fecha = f.toLocaleDateString("es-VE", { weekday: "long", day: "numeric", month: "long" });
        return { ok: true, data: { fecha: fecha, estado: hash % 3 !== 0 ? "Al día" : "Pendiente por verificar", documento: ced } };
      }

      case "pedido": {
        if (!u) return { ok: false, error: "Debes iniciar sesión para registrar tu pedido." };
        var nro = "SG-" + numero(6);
        var lpe = lista("sucregas-pedidos");
        lpe.push({ email: u.email, fecha: fechaHoy(), numero: nro, bombona: d.bombona || "18 kg", municipio: d.municipio || "", direccion: d.direccion || "", estado: "Recibido" });
        guardarLista("sucregas-pedidos", lpe);
        return { ok: true, data: { numero: nro } };
      }

      case "pago": {
        if (!u) return { ok: false, error: "Debes iniciar sesión para registrar tu pago." };
        var cmp = "CMP-" + numero(6);
        var lpa = lista("sucregas-pagos");
        lpa.push({ email: u.email, fecha: fechaHoy(), concepto: d.concepto || "", monto: d.monto || "", metodo: d.metodo || "", referencia: d.referencia || "", comprobante: cmp, estado: "Recibido" });
        guardarLista("sucregas-pagos", lpa);
        return { ok: true, data: { comprobante: cmp, estado: "Recibido" } };
      }

      case "pqr": {
        if (!u) return { ok: false, error: "Debes iniciar sesión para registrar tu solicitud." };
        var ticket = "PQR-" + new Date().getFullYear() + "-" + numero(6);
        var lq = lista("sucregas-pqr");
        lq.push({ email: u.email, fecha: fechaHoy(), ticket: ticket, tipo: d.tipo || "", mensaje: d.mensaje || "", estado: "Abierto" });
        guardarLista("sucregas-pqr", lq);
        return { ok: true, data: { ticket: ticket } };
      }

      case "misPedidos":
        if (!u) return { ok: false, error: "Debes iniciar sesión." };
        return { ok: true, data: lista("sucregas-pedidos").filter(function (x) { return x.email === u.email; }).reverse() };

      case "misPagos":
        if (!u) return { ok: false, error: "Debes iniciar sesión." };
        return { ok: true, data: lista("sucregas-pagos").filter(function (x) { return x.email === u.email; }).reverse() };

      case "misPQR":
        if (!u) return { ok: false, error: "Debes iniciar sesión." };
        return { ok: true, data: lista("sucregas-pqr").filter(function (x) { return x.email === u.email; }).reverse() };

      case "misFacturas": {
        if (!u) return { ok: false, error: "Debes iniciar sesión." };
        var lf = lista("sucregas-facturas").filter(function (x) { return x.email === u.email; });
        if (!lf.length) {
          // Datos de EJEMPLO para la demostración
          lf = [
            { email: u.email, periodo: "Agosto 2026", concepto: "Servicio de gas", monto: "2,30 $", estado: "Pagada", vence: "2026-08-15", fecha: fechaHoy() },
            { email: u.email, periodo: "Septiembre 2026", concepto: "Servicio de gas", monto: "2,30 $", estado: "Pendiente", vence: "2026-09-15", fecha: fechaHoy() }
          ];
          var todas = lista("sucregas-facturas");
          guardarLista("sucregas-facturas", todas.concat(lf));
        }
        return { ok: true, data: lf };
      }

      case "historial": {
        if (!u) return { ok: false, error: "Debes iniciar sesión." };
        var ev = [];
        lista("sucregas-pedidos").filter(function (x) { return x.email === u.email; }).forEach(function (p) {
          ev.push({ tipo: "Pedido", titulo: "Pedido " + p.numero, detalle: "Bombona " + p.bombona + " · " + p.estado, fecha: p.fecha });
        });
        lista("sucregas-pagos").filter(function (x) { return x.email === u.email; }).forEach(function (p) {
          ev.push({ tipo: "Pago", titulo: "Pago " + p.comprobante, detalle: p.concepto + " · " + p.monto + " · " + p.estado, fecha: p.fecha });
        });
        lista("sucregas-pqr").filter(function (x) { return x.email === u.email; }).forEach(function (p) {
          ev.push({ tipo: "Reclamo", titulo: "Ticket " + p.ticket, detalle: p.tipo + " · " + p.estado, fecha: p.fecha });
        });
        return { ok: true, data: ev };
      }

      default:
        return { ok: false, error: "Acción no disponible." };
    }
  }

  /* Intentos de login (solo demo) */
  function intentosDemo(email) {
    var it = lista("sucregas-intentos");
    for (var i = 0; i < it.length; i++) {
      if (it[i].email === email && Date.now() - it[i].t < 900000) return it[i].n;
    }
    return 0;
  }
  function sumarIntento(email) {
    var it = lista("sucregas-intentos");
    var encontrado = false;
    for (var i = 0; i < it.length; i++) {
      if (it[i].email === email) {
        it[i].n = (Date.now() - it[i].t < 900000) ? it[i].n + 1 : 1;
        it[i].t = Date.now();
        encontrado = true;
      }
    }
    if (!encontrado) it.push({ email: email, n: 1, t: Date.now() });
    guardarLista("sucregas-intentos", it);
  }
  function limpiarIntentos(email) {
    guardarLista("sucregas-intentos", lista("sucregas-intentos").filter(function (x) { return x.email !== email; }));
  }

  // API pública usada por la página
  window.SucreApi = {
    demoMode: function () { return !cfg.apiBase; },
    csrf: function () { return pedir("csrf", {}); },
    captcha: function (d) { return pedir("captcha", d || {}); },
    registro: function (d) { return pedir("registro", d); },
    verificar: function (d) { return pedir("verificar", d); },
    reenviarVerificacion: function (d) { return pedir("reenviarVerificacion", d || {}); },
    login: function (d) { return pedir("login", d); },
    sesion: function () { return pedir("sesion", {}); },
    cerrar: function () { return pedir("cerrar", {}); },
    cerrarTodas: function () { return pedir("cerrarTodas", {}); },
    recuperar: function (d) { return pedir("recuperar", d); },
    restablecer: function (d) { return pedir("restablecer", d); },
    cambiarPassword: function (d) { return pedir("cambiarPassword", d); },
    perfil: function (d) { return pedir("perfil", d || {}); },
    actualizarPerfil: function (d) { return pedir("actualizarPerfil", d); },
    consultar: function (d) { return pedir("consultar", d); },
    pedido: function (d) { return pedir("pedido", d); },
    pago: function (d) { return pedir("pago", d); },
    pqr: function (d) { return pedir("pqr", d); },
    misPedidos: function () { return pedir("misPedidos", {}); },
    misPagos: function () { return pedir("misPagos", {}); },
    misFacturas: function () { return pedir("misFacturas", {}); },
    misPQR: function () { return pedir("misPQR", {}); },
    historial: function () { return pedir("historial", {}); }
  };
})();
