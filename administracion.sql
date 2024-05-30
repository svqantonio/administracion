DROP DATABASE IF EXISTS administracion;
CREATE DATABASE administracion CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE administracion;

DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS tokens;

CREATE TABLE IF NOT EXISTS roles(
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(255) UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role INT(11) NOT NULL,
    FOREIGN KEY (role) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tokens (
    token VARCHAR(255) PRIMARY KEY,
    token_expiration DATETIME NOT NULL,
    user_id INT(11) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO roles (type) VALUES ('administrador'), ('normal');

INSERT INTO users (name, username, password, role) VALUES
('Antonio Gomez', 'svqantonio', '4a7d1ed414474e4033ac29ccb8653d9b', 1),
('Erling Haaland', 'EH_9', '4a7d1ed414474e4033ac29ccb8653d9b', 2),
('Rafa Mir', 'Rafita_12', '4a7d1ed414474e4033ac29ccb8653d9b', 2),
('Loren Mojon', 'LM14', '4a7d1ed414474e4033ac29ccb8653d9b', 2);

-- Añadir índices a las claves foráneas para mejorar el rendimiento
CREATE INDEX idx_role ON users(role);
CREATE INDEX idx_user_id ON tokens(user_id);