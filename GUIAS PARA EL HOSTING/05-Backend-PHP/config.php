<?php
/* ==========================================================================
   SucreGas — CONFIGURACIÓN (editado por la empresa antes de usar)
   --------------------------------------------------------------------------
   Pasos:
   1) En GoDaddy (cPanel) crear una base de datos MySQL y su usuario.
   2) Poner abajo el nombre, usuario y clave de esa base de datos.
   3) Importar schema.sql dentro de esa base (phpMyAdmin).
   4) Subir esta carpeta "backend" a public_html de GoDaddy.
   5) En el frontend (assets/js/api.js) poner  apiBase = "/backend/"
   ========================================================================== */

// Datos de la base de datos MySQL (GoDaddy usa "localhost")
define('DB_HOST', 'localhost');
define('DB_NAME', 'TU_BASE_DE_DATOS');
define('DB_USER', 'TU_USUARIO_BD');
define('DB_PASS', 'TU_CLAVE_BD');

// URL pública del sitio (sin barra final) para armar enlaces de recuperación
define('SITE_URL', 'https://TU-DOMINIO.com');

// Correo remitente para verificación y recuperación de contraseña
// (debe ser un correo del dominio; en GoDaddy se crea desde cPanel > Correo)
define('MAIL_FROM', 'no-reply@TU-DOMINIO.com');

// Opcional: para mayor compatibilidad, defina la zona horaria del servidor
date_default_timezone_set('America/Caracas');
