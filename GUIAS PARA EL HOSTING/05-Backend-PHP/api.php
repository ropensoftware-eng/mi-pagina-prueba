<?php
/* ==========================================================================
   SucreGas — API del backend (segura)
   --------------------------------------------------------------------------
   Acciones: captcha, csrf, registro, verificar, login, sesion, cerrar,
   cerrarTodas, recuperar, restablecer, cambiarPassword, perfil,
   actualizarPerfil, misPedidos, misPagos, misFacturas, misPQR, historial,
   Consultar, pedido, pago, pqr.

   Seguridad incluida:
     - password_hash / password_verify
     - Consultas preparadas (PDO)
     - Sesiones endurecidas (HttpOnly, Secure, SameSite, regenerate)
     - CSRF por token de sesión (cabecera X-CSRF)
     - CAPTCHA propio (sin servicios externos)
     - Límite de intentos (anti fuerza bruta)
     - Tokens de correo y "recordarme" guardados HASHEADOS
     - Cabeceras de seguridad
     - Auditoría de eventos
   ========================================================================== */
require_once __DIR__ . '/db.php';

/* No mostrar errores en producción (evita filtrar rutas del servidor) */
@ini_set('display_errors', '0');
@ini_set('log_errors', '1');
@error_reporting(E_ALL & ~E_DEPRECATED & ~E_NOTICE);

/* ------------------------------------------------------------------ */
/* Cabeceras de seguridad                                             */
/* ------------------------------------------------------------------ */
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Permissions-Policy: geolocation=(), microphone=(), camera=()');
header('Cross-Origin-Opener-Policy: same-origin');
header('Cross-Origin-Resource-Policy: same-origin');
header('X-Permitted-Cross-Domain-Policies: none');
header('Cache-Control: no-store');
if (es_https()) header('Strict-Transport-Security: max-age=31536000; includeSubDomains');

/* ------------------------------------------------------------------ */
/* Sesión endurecida                                                   */
/* ------------------------------------------------------------------ */
function iniciar_sesion_segura() {
    if (session_status() === PHP_SESSION_NONE) {
        @ini_set('session.use_strict_mode', '1');
        @ini_set('session.use_only_cookies', '1');
        $seguro = es_https();
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'httponly' => true,
            'secure' => $seguro,
            'samesite' => 'Lax'
        ]);
        session_start();
    }
}

/* Cierra la sesión por inactividad (minutos) */
function sesion_inactividad($min = 45) {
    if (session_status() !== PHP_SESSION_ACTIVE) return;
    if (!empty($_SESSION['ultima_actividad']) && (time() - intval($_SESSION['ultima_actividad'])) > $min * 60) {
        unset($_SESSION['usuario_id']); // sesión vencida: se cierra (conserva el CSRF)
    }
    $_SESSION['ultima_actividad'] = time();
}
iniciar_sesion_segura();
sesion_inactividad(45);

function ip_cliente() {
    return isset($_SERVER['REMOTE_ADDR']) ? substr($_SERVER['REMOTE_ADDR'], 0, 64) : '0.0.0.0';
}

function csrf_token() {
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function validar_csrf() {
    $enviado = isset($_SERVER['HTTP_X_CSRF']) ? $_SERVER['HTTP_X_CSRF'] : '';
    if (!$enviado || empty($_SESSION['csrf']) || !hash_equals($_SESSION['csrf'], $enviado)) {
        salida(['ok' => false, 'error' => 'Sesión no válida. Recarga la página e inténtalo de nuevo.']);
    }
}

/* Conexión segura (detecta HTTPS incluso detrás de proxy/CDN) */
function es_https() {
    if (!empty($_SERVER['HTTPS']) && strtolower((string)$_SERVER['HTTPS']) !== 'off') return true;
    if (isset($_SERVER['SERVER_PORT']) && (int)$_SERVER['SERVER_PORT'] === 443) return true;
    if (!empty($_SERVER['HTTP_X_FORWARDED_PROTO'])) {
        $proto = strtolower(trim(explode(',', (string)$_SERVER['HTTP_X_FORWARDED_PROTO'])[0]));
        if ($proto === 'https') return true;
    }
    if (!empty($_SERVER['HTTP_X_FORWARDED_SSL']) && strtolower((string)$_SERVER['HTTP_X_FORWARDED_SSL']) === 'on') return true;
    return false;
}
/* Nota: usuario_actual() ya está definida en db.php (evita "Cannot redeclare"). */

function registrar_auditoria($evento, $detalle = '', $email = null) {
    try {
        $st = db()->prepare('INSERT INTO auditoria (usuario_id, email, ip, evento, detalle) VALUES (?,?,?,?,?)');
        $st->execute([usuario_actual() ?: null, $email, ip_cliente(), $evento, mb_substr((string)$detalle, 0, 255)]);
    } catch (Exception $e) { /* la auditoría nunca debe romper el flujo */ }
}

function enviar_correo($para, $asunto, $cuerpo) {
    $de = defined('MAIL_FROM') ? MAIL_FROM : ('no-reply@' . (isset($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'localhost'));
    $cabeceras = "From: SucreGas <{$de}>\r\n" .
                 "Reply-To: {$de}\r\n" .
                 "MIME-Version: 1.0\r\n" .
                 "Content-Type: text/plain; charset=UTF-8\r\n";
    @mail($para, $asunto, $cuerpo, $cabeceras);
}

/* ------------------------------------------------------------------ */
/* CAPTCHA propio                                                      */
/* ------------------------------------------------------------------ */
function captcha_clave($scope) {
    $scope = preg_replace('/[^a-z0-9_]/i', '', (string)$scope);
    return $scope !== '' ? strtolower($scope) : 'general';
}

function captcha_generar($scope = 'general') {
    $scope = captcha_clave($scope);
    $a = random_int(2, 9);
    $b = random_int(2, 9);
    $suma = $a + $b;
    $_SESSION['captcha'][$scope] = [
        'h' => password_hash((string)$suma, PASSWORD_DEFAULT),
        'e' => time() + 600 // 10 minutos
    ];
    return "¿Cuánto es {$a} + {$b}?";
}

function captcha_validar($respuesta, $scope = 'general') {
    $scope = captcha_clave($scope);
    if (empty($_SESSION['captcha'][$scope]['h']) || empty($_SESSION['captcha'][$scope]['e'])) return false;
    if (time() > intval($_SESSION['captcha'][$scope]['e'])) { unset($_SESSION['captcha'][$scope]); return false; }
    $ok = password_verify(trim((string)$respuesta), $_SESSION['captcha'][$scope]['h']);
    unset($_SESSION['captcha'][$scope]); // un solo uso
    return $ok;
}

/* ------------------------------------------------------------------ */
/* Límite de intentos (anti fuerza bruta)                              */
/* ------------------------------------------------------------------ */
function intentos_estado($email) {
    $st = db()->prepare('SELECT intentos, ultimo FROM intentos_login WHERE email = ? AND ip = ? LIMIT 1');
    $st->execute([$email, ip_cliente()]);
    $fila = $st->fetch();
    if (!$fila) return 0;
    // Ventana de 15 minutos
    if (strtotime($fila['ultimo']) < time() - 900) return 0;
    return intval($fila['intentos']);
}

function intentos_sumar($email) {
    $ip = ip_cliente();
    $st = db()->prepare('SELECT id, intentos, ultimo FROM intentos_login WHERE email = ? AND ip = ? LIMIT 1');
    $st->execute([$email, $ip]);
    $fila = $st->fetch();
    if ($fila) {
        $n = (strtotime($fila['ultimo']) < time() - 900) ? 1 : intval($fila['intentos']) + 1;
        $up = db()->prepare('UPDATE intentos_login SET intentos = ?, ultimo = NOW() WHERE id = ?');
        $up->execute([$n, $fila['id']]);
    } else {
        $in = db()->prepare('INSERT INTO intentos_login (email, ip, intentos, ultimo) VALUES (?,?,1,NOW())');
        $in->execute([$email, $ip]);
    }
}

function intentos_limpiar($email) {
    $st = db()->prepare('DELETE FROM intentos_login WHERE email = ? AND ip = ?');
    $st->execute([$email, ip_cliente()]);
}

/* ------------------------------------------------------------------ */
/* "Recordarme" (selector + validador hasheado, rotativo)              */
/* ------------------------------------------------------------------ */
function recordar_crear($uid) {
    $selector = bin2hex(random_bytes(16));
    $validador = bin2hex(random_bytes(32));
    $st = db()->prepare('INSERT INTO recordar_tokens (usuario_id, selector, validador_hash, expira) VALUES (?,?,?, DATE_ADD(NOW(), INTERVAL 30 DAY))');
    $st->execute([$uid, $selector, password_hash($validador, PASSWORD_DEFAULT)]);
    $seguro = es_https();
    setcookie('sucregas_recordar', $selector . ':' . $validador, [
        'expires' => time() + 60 * 60 * 24 * 30,
        'path' => '/',
        'httponly' => true,
        'secure' => $seguro,
        'samesite' => 'Lax'
    ]);
}

function recordar_validar() {
    if (empty($_COOKIE['sucregas_recordar'])) return 0;
    $partes = explode(':', $_COOKIE['sucregas_recordar'], 2);
    if (count($partes) !== 2) return 0;
    list($selector, $validador) = $partes;
    $st = db()->prepare('SELECT id, usuario_id, validador_hash FROM recordar_tokens WHERE selector = ? AND expira > NOW() LIMIT 1');
    $st->execute([$selector]);
    $fila = $st->fetch();
    if (!$fila || !password_verify($validador, $fila['validador_hash'])) return 0;
    // Rotar el validador (evita reutilización)
    db()->prepare('DELETE FROM recordar_tokens WHERE id = ?')->execute([$fila['id']]);
    recordar_crear(intval($fila['usuario_id']));
    return intval($fila['usuario_id']);
}

function recordar_borrar() {
    if (!empty($_COOKIE['sucregas_recordar'])) {
        $selector = explode(':', $_COOKIE['sucregas_recordar'], 2)[0];
        $st = db()->prepare('DELETE FROM recordar_tokens WHERE selector = ?');
        $st->execute([$selector]);
    }
    setcookie('sucregas_recordar', '', ['expires' => time() - 3600, 'path' => '/']);
}

/* ------------------------------------------------------------------ */
/* Entrada                                                             */
/* ------------------------------------------------------------------ */
$entrada = json_decode(file_get_contents('php://input'), true);
if (!is_array($entrada)) $entrada = [];
$accion = isset($_GET['accion']) ? $_GET['accion'] : (isset($entrada['accion']) ? $entrada['accion'] : '');
$pdo = db();
$uid = usuario_actual();

function campo($e, $k, $def = '') { return isset($e[$k]) ? trim((string)$e[$k]) : $def; }

// Acciones públicas (no requieren CSRF)
$publicas = ['captcha', 'csrf', 'registro', 'login', 'recuperar', 'restablecer', 'verificar', 'sesion'];
if (!in_array($accion, $publicas, true)) {
    validar_csrf();
}

switch ($accion) {

    /* ---------- CSRF ---------- */
    case 'csrf':
        salida(['ok' => true, 'data' => ['token' => csrf_token()]]);

    /* ---------- CAPTCHA ---------- */
    case 'captcha':
        salida(['ok' => true, 'data' => ['pregunta' => captcha_generar(campo($entrada, 'scope', 'general'))]]);

    /* ---------- REGISTRO ---------- */
    case 'registro': {
        if (intentos_estado('#registro') >= 10) {
            salida(['ok' => false, 'error' => 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.']);
        }
        intentos_sumar('#registro');
        if (!captcha_validar(campo($entrada, 'captcha'), 'register')) {
            salida(['ok' => false, 'error' => 'Verificación incorrecta. Inténtalo de nuevo.']);
        }
        $nombre = campo($entrada, 'nombre');
        $cedula = campo($entrada, 'cedula');
        $telefono = campo($entrada, 'telefono');
        $email = strtolower(campo($entrada, 'email'));
        $pass = campo($entrada, 'password');
        if ($nombre === '' || $cedula === '' || $telefono === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            salida(['ok' => false, 'error' => 'Datos incompletos o inválidos.']);
        }
        if (strlen($pass) < 8) salida(['ok' => false, 'error' => 'La contraseña debe tener al menos 8 caracteres.']);
        $chk = $pdo->prepare('SELECT id FROM usuarios WHERE email = ? OR cedula = ? LIMIT 1');
        $chk->execute([$email, $cedula]);
        if ($chk->fetch()) salida(['ok' => false, 'error' => 'No se pudo crear la cuenta con esos datos.']);
        $hash = password_hash($pass, PASSWORD_DEFAULT);
        $st = $pdo->prepare('INSERT INTO usuarios (nombre, cedula, telefono, email, password) VALUES (?,?,?,?,?)');
        $st->execute([$nombre, $cedula, $telefono, $email, $hash]);
        $id = (int)$pdo->lastInsertId();

        // Correo de verificación
        $token = bin2hex(random_bytes(32));
        $ins = $pdo->prepare('INSERT INTO email_tokens (usuario_id, email, tipo, token_hash, expira) VALUES (?,?,?,?, DATE_ADD(NOW(), INTERVAL 24 HOUR))');
        $ins->execute([$id, $email, 'verificacion', hash('sha256', $token)]);
        $enlace = SITE_URL . '/cuenta.html?verificar=' . $token;
        enviar_correo($email, 'Verifica tu cuenta - SucreGas', "Para verificar tu cuenta abre: $enlace");

        session_regenerate_id(true);
        $_SESSION['usuario_id'] = $id;
        registrar_auditoria('registro', 'Nueva cuenta', $email);
        salida(['ok' => true, 'data' => ['id' => $id, 'nombre' => $nombre, 'cedula' => $cedula, 'telefono' => $telefono, 'email' => $email, 'verificado' => 0]]);
    }

    /* ---------- VERIFICAR CORREO ---------- */
    case 'verificar': {
        $token = campo($entrada, 'token');
        if ($token === '') salida(['ok' => false, 'error' => 'Enlace no válido.']);
        $st = $pdo->prepare('SELECT id, usuario_id FROM email_tokens WHERE token_hash = ? AND tipo = "verificacion" AND usado = 0 AND expira > NOW() LIMIT 1');
        $st->execute([hash('sha256', $token)]);
        $fila = $st->fetch();
        if (!$fila) salida(['ok' => false, 'error' => 'El enlace es inválido o expiró.']);
        $pdo->prepare('UPDATE usuarios SET verificado = 1 WHERE id = ?')->execute([$fila['usuario_id']]);
        $pdo->prepare('UPDATE email_tokens SET usado = 1 WHERE id = ?')->execute([$fila['id']]);
        registrar_auditoria('correo_verificado', 'Usuario ' . $fila['usuario_id']);
        salida(['ok' => true, 'data' => 'Correo verificado.']);
    }

    /* ---------- REENVIAR VERIFICACIÓN DE CORREO (con sesión) ---------- */
    case 'reenviarVerificacion': {
        if (!$uid) salida(['ok' => false, 'error' => 'Debes iniciar sesión.']);
        $st = $pdo->prepare('SELECT email, verificado FROM usuarios WHERE id = ?');
        $st->execute([$uid]);
        $u = $st->fetch();
        if (!$u) salida(['ok' => false, 'error' => 'Debes iniciar sesión.']);
        if ((int)$u['verificado'] === 1) salida(['ok' => true, 'data' => 'Tu correo ya está verificado.']);
        $token = bin2hex(random_bytes(32));
        $ins = $pdo->prepare('INSERT INTO email_tokens (usuario_id, email, tipo, token_hash, expira) VALUES (?,?,?,?, DATE_ADD(NOW(), INTERVAL 24 HOUR))');
        $ins->execute([$uid, $u['email'], 'verificacion', hash('sha256', $token)]);
        $enlace = SITE_URL . '/cuenta.html?verificar=' . $token;
        enviar_correo($u['email'], 'Verifica tu cuenta - SucreGas', "Para verificar tu cuenta abre: $enlace");
        registrar_auditoria('verificacion_reenviada', 'Correo de verificación reenviado', $u['email']);
        salida(['ok' => true, 'data' => 'Te enviamos un correo con el enlace de verificación. Revisa tu bandeja.']);
    }

    /* ---------- INICIAR SESIÓN ---------- */
    case 'login': {
        $email = strtolower(campo($entrada, 'email'));
        $pass = campo($entrada, 'password');
        $recordar = !empty($entrada['recordar']);

        if (intentos_estado($email) >= 5) {
            salida(['ok' => false, 'error' => 'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.']);
        }
        if (!captcha_validar(campo($entrada, 'captcha'), 'login')) {
            salida(['ok' => false, 'error' => 'Verificación incorrecta. Inténtalo de nuevo.']);
        }
        $st = $pdo->prepare('SELECT * FROM usuarios WHERE email = ? LIMIT 1');
        $st->execute([$email]);
        $u = $st->fetch();
        if (!$u || !password_verify($pass, $u['password'])) {
            intentos_sumar($email);
            registrar_auditoria('login_fallido', 'Credenciales incorrectas', $email);
            salida(['ok' => false, 'error' => 'Correo o contraseña incorrectos.']);
        }
        intentos_limpiar($email);
        if (!empty($u['bloqueado_hasta']) && strtotime($u['bloqueado_hasta']) > time()) {
            salida(['ok' => false, 'error' => 'Cuenta temporalmente bloqueada. Inténtalo más tarde.']);
        }
        session_regenerate_id(true);
        $_SESSION['usuario_id'] = (int)$u['id'];
        $pdo->prepare('UPDATE usuarios SET ultimo_acceso = NOW(), intentos = 0 WHERE id = ?')->execute([$u['id']]);
        if ($recordar) recordar_crear((int)$u['id']);
        registrar_auditoria('login', 'Inicio de sesión', $email);
        salida(['ok' => true, 'data' => ['id' => (int)$u['id'], 'nombre' => $u['nombre'], 'cedula' => $u['cedula'], 'telefono' => $u['telefono'], 'email' => $u['email'], 'verificado' => (int)$u['verificado']]]);
    }

    /* ---------- SESIÓN ACTUAL ---------- */
    case 'sesion': {
        if (!$uid) {
            $porRecordar = recordar_validar();
            if ($porRecordar) {
                session_regenerate_id(true);
                $_SESSION['usuario_id'] = $porRecordar;
                $uid = $porRecordar;
            }
        }
        if (!$uid) salida(['ok' => false, 'error' => 'No hay sesión.']);
        $st = $pdo->prepare('SELECT id, nombre, cedula, telefono, email, verificado, ultimo_acceso FROM usuarios WHERE id = ?');
        $st->execute([$uid]);
        $u = $st->fetch();
        if (!$u) salida(['ok' => false, 'error' => 'No hay sesión.']);
        salida(['ok' => true, 'data' => $u]);
    }

    /* ---------- CERRAR SESIÓN ---------- */
    case 'cerrar': {
        recordar_borrar();
        registrar_auditoria('logout', 'Cierre de sesión');
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $p = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
        }
        session_destroy();
        salida(['ok' => true, 'data' => 'Sesión cerrada.']);
    }

    /* ---------- CERRAR TODAS LAS SESIONES ---------- */
    case 'cerrarTodas': {
        if (!$uid) salida(['ok' => false, 'error' => 'Debes iniciar sesión.']);
        $pdo->prepare('DELETE FROM recordar_tokens WHERE usuario_id = ?')->execute([$uid]);
        registrar_auditoria('cerrar_todas', 'Se cerraron todas las sesiones');
        recordar_borrar();
        $_SESSION = [];
        session_destroy();
        salida(['ok' => true, 'data' => 'Se cerraron todas las sesiones.']);
    }

    /* ---------- RECUPERAR CONTRASEÑA ---------- */
    case 'recuperar': {
        if (intentos_estado('#recuperar') >= 5) {
            salida(['ok' => true, 'data' => 'Si el correo está registrado, recibirás un enlace.']);
        }
        intentos_sumar('#recuperar');
        if (!captcha_validar(campo($entrada, 'captcha'), 'recover')) {
            salida(['ok' => false, 'error' => 'Verificación incorrecta. Inténtalo de nuevo.']);
        }
        $email = strtolower(campo($entrada, 'email'));
        if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $st = $pdo->prepare('SELECT id FROM usuarios WHERE email = ? LIMIT 1');
            $st->execute([$email]);
            $u = $st->fetch();
            if ($u) {
                $token = bin2hex(random_bytes(32));
                $ins = $pdo->prepare('INSERT INTO email_tokens (usuario_id, email, tipo, token_hash, expira) VALUES (?,?,?,?, DATE_ADD(NOW(), INTERVAL 2 HOUR))');
                $ins->execute([$u['id'], $email, 'recuperacion', hash('sha256', $token)]);
                $enlace = SITE_URL . '/cuenta.html?token=' . $token;
                enviar_correo($email, 'Recuperación de contraseña - SucreGas', "Para restablecer tu contraseña abre: $enlace\nEl enlace vence en 2 horas.");
                registrar_auditoria('recuperar', 'Enlace enviado', $email);
            }
        }
        // Respuesta genérica (no revela si el correo existe)
        salida(['ok' => true, 'data' => 'Si el correo está registrado, recibirás un enlace.']);
    }

    /* ---------- RESTABLECER CONTRASEÑA ---------- */
    case 'restablecer': {
        $token = campo($entrada, 'token');
        $pass = campo($entrada, 'password');
        if (strlen($pass) < 8) salida(['ok' => false, 'error' => 'La contraseña debe tener al menos 8 caracteres.']);
        if ($token === '') salida(['ok' => false, 'error' => 'Solicita un nuevo enlace de recuperación.']);
        $st = $pdo->prepare('SELECT id, usuario_id, email FROM email_tokens WHERE token_hash = ? AND tipo = "recuperacion" AND usado = 0 AND expira > NOW() LIMIT 1');
        $st->execute([hash('sha256', $token)]);
        $fila = $st->fetch();
        if (!$fila) salida(['ok' => false, 'error' => 'El enlace es inválido o expiró. Solicita uno nuevo.']);
        $u = $pdo->prepare('SELECT id, password FROM usuarios WHERE id = ?');
        $u->execute([$fila['usuario_id']]);
        $usuario = $u->fetch();
        if (!$usuario) salida(['ok' => false, 'error' => 'No encontramos la cuenta.']);
        if (password_verify($pass, $usuario['password'])) {
            salida(['ok' => false, 'error' => 'La nueva contraseña no puede ser igual a la anterior.']);
        }
        $hash = password_hash($pass, PASSWORD_DEFAULT);
        $pdo->prepare('UPDATE usuarios SET pass_anterior = password, password = ? WHERE id = ?')->execute([$hash, $usuario['id']]);
        $pdo->prepare('UPDATE email_tokens SET usado = 1 WHERE usuario_id = ? AND tipo = "recuperacion"')->execute([$usuario['id']]);
        $pdo->prepare('DELETE FROM recordar_tokens WHERE usuario_id = ?')->execute([$usuario['id']]);
        enviar_correo($fila['email'], 'Tu contraseña cambió - SucreGas', 'Tu contraseña fue actualizada. Si no fuiste tú, contáctanos de inmediato.');
        registrar_auditoria('password_restablecida', 'Contraseña actualizada', $fila['email']);
        salida(['ok' => true, 'data' => 'Contraseña actualizada.']);
    }

    /* ---------- CAMBIAR CONTRASEÑA (con sesión) ---------- */
    case 'cambiarPassword': {
        if (!$uid) salida(['ok' => false, 'error' => 'Debes iniciar sesión.']);
        $actual = campo($entrada, 'actual');
        $nueva = campo($entrada, 'nueva');
        if (strlen($nueva) < 8) salida(['ok' => false, 'error' => 'La nueva contraseña debe tener al menos 8 caracteres.']);
        $st = $pdo->prepare('SELECT email, password FROM usuarios WHERE id = ?');
        $st->execute([$uid]);
        $u = $st->fetch();
        if (!$u || !password_verify($actual, $u['password'])) {
            salida(['ok' => false, 'error' => 'La contraseña actual no es correcta.']);
        }
        if (password_verify($nueva, $u['password'])) {
            salida(['ok' => false, 'error' => 'La nueva contraseña no puede ser igual a la actual.']);
        }
        $hash = password_hash($nueva, PASSWORD_DEFAULT);
        $pdo->prepare('UPDATE usuarios SET pass_anterior = password, password = ? WHERE id = ?')->execute([$hash, $uid]);
        enviar_correo($u['email'], 'Tu contraseña cambió - SucreGas', 'Tu contraseña fue actualizada desde tu cuenta.');
        registrar_auditoria('password_cambiada', 'Cambio de contraseña');
        salida(['ok' => true, 'data' => 'Contraseña actualizada.']);
    }

    /* ---------- MI PERFIL ---------- */
    case 'perfil': {
        if (!$uid) salida(['ok' => false, 'error' => 'Debes iniciar sesión.']);
        $st = $pdo->prepare('SELECT id, nombre, cedula, telefono, email, verificado, ultimo_acceso, creado FROM usuarios WHERE id = ?');
        $st->execute([$uid]);
        $u = $st->fetch();
        if (!$u) salida(['ok' => false, 'error' => 'Debes iniciar sesión.']);
        salida(['ok' => true, 'data' => $u]);
    }

    /* ---------- ACTUALIZAR PERFIL ---------- */
    case 'actualizarPerfil': {
        if (!$uid) salida(['ok' => false, 'error' => 'Debes iniciar sesión.']);
        $nombre = campo($entrada, 'nombre');
        $telefono = campo($entrada, 'telefono');
        if ($nombre !== '') {
            $pdo->prepare('UPDATE usuarios SET nombre = ?, telefono = ? WHERE id = ?')->execute([$nombre, $telefono, $uid]);
        } else {
            $pdo->prepare('UPDATE usuarios SET telefono = ? WHERE id = ?')->execute([$telefono, $uid]);
        }
        registrar_auditoria('perfil_actualizado', 'Datos del perfil');
        $st = $pdo->prepare('SELECT id, nombre, cedula, telefono, email, verificado FROM usuarios WHERE id = ?');
        $st->execute([$uid]);
        salida(['ok' => true, 'data' => $st->fetch()]);
    }

    /* ---------- MIS PEDIDOS ---------- */
    case 'misPedidos': {
        if (!$uid) salida(['ok' => false, 'error' => 'Debes iniciar sesión.']);
        $st = $pdo->prepare('SELECT numero, bombona, municipio, direccion, estado, creado FROM pedidos WHERE usuario_id = ? ORDER BY id DESC');
        $st->execute([$uid]);
        $filas = $st->fetchAll();
        foreach ($filas as $k => $f) { $filas[$k]['fecha'] = substr($f['creado'], 0, 10); }
        salida(['ok' => true, 'data' => $filas]);
    }

    /* ---------- MIS PAGOS ---------- */
    case 'misPagos': {
        if (!$uid) salida(['ok' => false, 'error' => 'Debes iniciar sesión.']);
        $st = $pdo->prepare('SELECT concepto, monto, metodo, referencia, comprobante, estado, creado FROM pagos WHERE usuario_id = ? ORDER BY id DESC');
        $st->execute([$uid]);
        $filas = $st->fetchAll();
        foreach ($filas as $k => $f) { $filas[$k]['fecha'] = substr($f['creado'], 0, 10); }
        salida(['ok' => true, 'data' => $filas]);
    }

    /* ---------- MIS FACTURAS ---------- */
    case 'misFacturas': {
        if (!$uid) salida(['ok' => false, 'error' => 'Debes iniciar sesión.']);
        $st = $pdo->prepare('SELECT periodo, concepto, monto, estado, vence, creado FROM facturas WHERE usuario_id = ? ORDER BY id DESC');
        $st->execute([$uid]);
        $filas = $st->fetchAll();
        foreach ($filas as $k => $f) { $filas[$k]['fecha'] = substr($f['creado'], 0, 10); }
        salida(['ok' => true, 'data' => $filas]);
    }

    /* ---------- MIS RECLAMOS (PQR) ---------- */
    case 'misPQR': {
        if (!$uid) salida(['ok' => false, 'error' => 'Debes iniciar sesión.']);
        $st = $pdo->prepare('SELECT ticket, tipo, mensaje, estado, creado FROM pqr WHERE usuario_id = ? ORDER BY id DESC');
        $st->execute([$uid]);
        $filas = $st->fetchAll();
        foreach ($filas as $k => $f) { $filas[$k]['fecha'] = substr($f['creado'], 0, 10); }
        salida(['ok' => true, 'data' => $filas]);
    }

    /* ---------- HISTORIAL (todo lo del usuario) ---------- */
    case 'historial': {
        if (!$uid) salida(['ok' => false, 'error' => 'Debes iniciar sesión.']);
        $eventos = [];
        $st = $pdo->prepare('SELECT numero, bombona, estado, creado FROM pedidos WHERE usuario_id = ? ORDER BY id DESC LIMIT 50');
        $st->execute([$uid]);
        foreach ($st->fetchAll() as $f) {
            $eventos[] = ['tipo' => 'Pedido', 'titulo' => 'Pedido ' . $f['numero'], 'detalle' => 'Bombona ' . $f['bombona'] . ' · ' . $f['estado'], 'fecha' => $f['creado']];
        }
        $st = $pdo->prepare('SELECT concepto, monto, comprobante, estado, creado FROM pagos WHERE usuario_id = ? ORDER BY id DESC LIMIT 50');
        $st->execute([$uid]);
        foreach ($st->fetchAll() as $f) {
            $eventos[] = ['tipo' => 'Pago', 'titulo' => 'Pago ' . $f['comprobante'], 'detalle' => $f['concepto'] . ' · ' . $f['monto'] . ' · ' . $f['estado'], 'fecha' => $f['creado']];
        }
        $st = $pdo->prepare('SELECT periodo, monto, estado, creado FROM facturas WHERE usuario_id = ? ORDER BY id DESC LIMIT 50');
        $st->execute([$uid]);
        foreach ($st->fetchAll() as $f) {
            $eventos[] = ['tipo' => 'Factura', 'titulo' => 'Factura ' . $f['periodo'], 'detalle' => $f['monto'] . ' · ' . $f['estado'], 'fecha' => $f['creado']];
        }
        $st = $pdo->prepare('SELECT ticket, tipo, estado, creado FROM pqr WHERE usuario_id = ? ORDER BY id DESC LIMIT 50');
        $st->execute([$uid]);
        foreach ($st->fetchAll() as $f) {
            $eventos[] = ['tipo' => 'Reclamo', 'titulo' => 'Ticket ' . $f['ticket'], 'detalle' => $f['tipo'] . ' · ' . $f['estado'], 'fecha' => $f['creado']];
        }
        $st = $pdo->prepare('SELECT evento, creado FROM auditoria WHERE usuario_id = ? AND evento IN ("login","logout") ORDER BY id DESC LIMIT 20');
        $st->execute([$uid]);
        foreach ($st->fetchAll() as $f) {
            $eventos[] = ['tipo' => 'Sesión', 'titulo' => ($f['evento'] === 'login' ? 'Inicio de sesión' : 'Cierre de sesión'), 'detalle' => '', 'fecha' => $f['creado']];
        }
        usort($eventos, function ($a, $b) { return strtotime($b['fecha']) - strtotime($a['fecha']); });
        salida(['ok' => true, 'data' => array_slice($eventos, 0, 60)]);
    }

    /* ---------- CONSULTA POR CÉDULA ---------- */
    case 'consultar': {
        $doc = campo($entrada, 'documento', campo($entrada, 'cedula'));
        // Respuesta uniforme: no revela si la cédula está registrada (evita enumeración)
        $hash = 0;
        $len = strlen($doc);
        for ($i = 0; $i < $len; $i++) { $hash = (($hash * 31) + ord($doc[$i])) & 0x7FFFFFFF; }
        $estado = ($hash % 3 !== 0) ? 'Al día' : 'Pendiente por verificar';
        salida(['ok' => true, 'data' => ['documento' => $doc, 'estado' => $estado, 'fecha' => 'Consulta tu punto de despacho en Rutas']]);
    }

    /* ---------- PEDIDO DE GAS (requiere sesión) ---------- */
    case 'pedido': {
        if (!$uid) salida(['ok' => false, 'error' => 'Debes iniciar sesión para registrar tu pedido.']);
        // Datos del cliente tomados de la sesión (no de lo que manda el navegador)
        $du = $pdo->prepare('SELECT nombre, cedula, telefono FROM usuarios WHERE id = ?');
        $du->execute([$uid]);
        $du = $du->fetch() ?: ['nombre' => 'Cliente', 'cedula' => '', 'telefono' => ''];
        $nombre = $du['nombre'];
        $cedula = $du['cedula'];
        $telefono = $du['telefono'];
        $municipio = campo($entrada, 'municipio', '');
        $bombona = campo($entrada, 'bombona', '18');
        $direccion = campo($entrada, 'direccion', '');
        $nota = campo($entrada, 'nota');
        $numero = 'SG-' . date('y') . '-' . str_pad((string)random_int(1, 999999), 6, '0', STR_PAD_LEFT);
        $st = $pdo->prepare('INSERT INTO pedidos (usuario_id, nombre, cedula, telefono, municipio, bombona, direccion, nota, numero) VALUES (?,?,?,?,?,?,?,?,?)');
        $st->execute([$uid, $nombre, $cedula, $telefono, $municipio, $bombona, $direccion, $nota, $numero]);
        registrar_auditoria('pedido', 'Pedido ' . $numero);
        salida(['ok' => true, 'data' => ['numero' => $numero]]);
    }

    /* ---------- REGISTRAR PAGO (requiere sesión) ---------- */
    case 'pago': {
        if (!$uid) salida(['ok' => false, 'error' => 'Debes iniciar sesión para registrar tu pago.']);
        $concepto = campo($entrada, 'concepto');
        $monto = campo($entrada, 'monto');
        $metodo = campo($entrada, 'metodo');
        $referencia = campo($entrada, 'referencia');
        $comprobante = 'CMP-' . date('y') . '-' . str_pad((string)random_int(1, 999999), 6, '0', STR_PAD_LEFT);
        $st = $pdo->prepare('INSERT INTO pagos (usuario_id, concepto, monto, metodo, referencia, comprobante) VALUES (?,?,?,?,?,?)');
        $st->execute([$uid, $concepto, $monto, $metodo, $referencia, $comprobante]);
        registrar_auditoria('pago', 'Pago ' . $comprobante);
        salida(['ok' => true, 'data' => ['comprobante' => $comprobante, 'estado' => 'recibido']]);
    }

    /* ---------- QUEJA / RECLAMO (requiere sesión) ---------- */
    case 'pqr': {
        if (!$uid) salida(['ok' => false, 'error' => 'Debes iniciar sesión para registrar tu solicitud.']);
        // Datos del cliente tomados de la sesión (no de lo que manda el navegador)
        $du = $pdo->prepare('SELECT nombre, cedula, telefono FROM usuarios WHERE id = ?');
        $du->execute([$uid]);
        $du = $du->fetch() ?: ['nombre' => 'Cliente', 'cedula' => '', 'telefono' => ''];
        $nombre = $du['nombre'];
        $cedula = $du['cedula'];
        $telefono = $du['telefono'];
        $tipo = campo($entrada, 'tipo');
        $mensaje = campo($entrada, 'mensaje');
        $ticket = 'PQR-' . date('Y') . '-' . str_pad((string)random_int(1, 999999), 6, '0', STR_PAD_LEFT);
        $st = $pdo->prepare('INSERT INTO pqr (usuario_id, nombre, cedula, telefono, tipo, mensaje, ticket) VALUES (?,?,?,?,?,?,?)');
        $st->execute([$uid, $nombre, $cedula, $telefono, $tipo, $mensaje, $ticket]);
        registrar_auditoria('pqr', 'Ticket ' . $ticket);
        salida(['ok' => true, 'data' => ['ticket' => $ticket]]);
    }

    default:
        salida(['ok' => false, 'error' => 'Acción no disponible.']);
}
