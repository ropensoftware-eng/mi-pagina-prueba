<?php
/* ==========================================================================
   SucreGas — Conexión a la base de datos + utilidades
   ========================================================================== */
require_once __DIR__ . '/config.php';

function db() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $pdo = new PDO(
                'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
                DB_USER,
                DB_PASS,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch (PDOException $e) {
            salida(['ok' => false, 'error' => 'No se pudo conectar con la base de datos. Revisa backend/config.php']);
        }
    }
    return $pdo;
}

function salida($data) {
    if (!headers_sent()) header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function inicio_sesion() {
    if (session_status() === PHP_SESSION_NONE) session_start();
}

function usuario_actual() {
    inicio_sesion();
    return isset($_SESSION['usuario_id']) ? intval($_SESSION['usuario_id']) : 0;
}

function token_secreto() {
    return defined('TOKEN_SECRETO') ? TOKEN_SECRETO : (DB_PASS . '|' . DB_NAME);
}
