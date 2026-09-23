-- ==========================================================================
-- SucreGas — Estructura de la base de datos
-- Importar este archivo en la base MySQL creada en GoDaddy (phpMyAdmin).
-- ==========================================================================

CREATE TABLE IF NOT EXISTS usuarios (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  cedula VARCHAR(30) NOT NULL,
  telefono VARCHAR(30) NOT NULL,
  email VARCHAR(160) NOT NULL,
  password VARCHAR(255) NOT NULL,
  pass_anterior VARCHAR(255) NULL,
  verificado TINYINT(1) NOT NULL DEFAULT 0,
  ultimo_acceso DATETIME NULL,
  intentos INT UNSIGNED NOT NULL DEFAULT 0,
  bloqueado_hasta DATETIME NULL,
  creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_email (email),
  UNIQUE KEY uq_cedula (cedula)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pedidos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NULL,
  nombre VARCHAR(120) NOT NULL,
  cedula VARCHAR(30) NOT NULL,
  telefono VARCHAR(30) NOT NULL,
  municipio VARCHAR(80) NOT NULL,
  bombona VARCHAR(20) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  nota VARCHAR(255) DEFAULT '',
  numero VARCHAR(40) NOT NULL,
  estado VARCHAR(30) DEFAULT 'recibido',
  creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_usuario (usuario_id),
  KEY idx_numero (numero)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pagos (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NULL,
  concepto VARCHAR(120) NOT NULL,
  monto VARCHAR(60) NOT NULL,
  metodo VARCHAR(40) NOT NULL,
  referencia VARCHAR(120) NOT NULL,
  comprobante VARCHAR(40) NOT NULL,
  estado VARCHAR(30) DEFAULT 'recibido',
  creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_usuario (usuario_id),
  KEY idx_referencia (referencia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS facturas (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  periodo VARCHAR(40) NOT NULL,
  concepto VARCHAR(120) DEFAULT 'Servicio de gas',
  monto VARCHAR(60) NOT NULL,
  estado VARCHAR(30) DEFAULT 'pendiente',
  vence DATE NULL,
  creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pqr (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NULL,
  nombre VARCHAR(120) NOT NULL,
  cedula VARCHAR(30) NOT NULL,
  telefono VARCHAR(30) NOT NULL,
  tipo VARCHAR(40) NOT NULL,
  mensaje TEXT NOT NULL,
  ticket VARCHAR(40) NOT NULL,
  estado VARCHAR(30) DEFAULT 'abierto',
  creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_ticket (ticket),
  KEY idx_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tokens de verificación de correo y recuperación (se guardan HASHEADOS)
CREATE TABLE IF NOT EXISTS email_tokens (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NULL,
  email VARCHAR(160) NOT NULL,
  tipo VARCHAR(20) NOT NULL, -- 'verificacion' | 'recuperacion'
  token_hash VARCHAR(255) NOT NULL,
  expira DATETIME NOT NULL,
  usado TINYINT(1) NOT NULL DEFAULT 0,
  creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_token (token_hash),
  KEY idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- "Recordarme" (selector + validador hasheado, rotativo)
CREATE TABLE IF NOT EXISTS recordar_tokens (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NOT NULL,
  selector VARCHAR(64) NOT NULL,
  validador_hash VARCHAR(255) NOT NULL,
  expira DATETIME NOT NULL,
  creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_selector (selector),
  KEY idx_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Límite de intentos de acceso (anti fuerza bruta)
CREATE TABLE IF NOT EXISTS intentos_login (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(160) NOT NULL,
  ip VARCHAR(64) NOT NULL,
  intentos INT UNSIGNED NOT NULL DEFAULT 1,
  ultimo DATETIME NOT NULL,
  UNIQUE KEY uq_email_ip (email, ip),
  KEY idx_ultimo (ultimo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Auditoría de eventos de seguridad
CREATE TABLE IF NOT EXISTS auditoria (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT UNSIGNED NULL,
  email VARCHAR(160) NULL,
  ip VARCHAR(64) NULL,
  evento VARCHAR(60) NOT NULL,
  detalle VARCHAR(255) NULL,
  creado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_usuario (usuario_id),
  KEY idx_evento (evento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
