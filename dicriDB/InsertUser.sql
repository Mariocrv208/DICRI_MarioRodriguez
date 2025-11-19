-- 2_init_users.sql
USE dicri_db;
GO
INSERT INTO dicri.Usuario (nombre, correo, password_hash, rol)
VALUES 
('Tecnico Demo', 'tecnico@demo.com', '$2b$10$uQG6o6rYh1q8b3nQeKz0W.8Yy5Jq4Qn1R6v9y3FZQ8G7xY3f6bCq', 'tecnico'), -- password: 'password123' hashed
('Coordinador Demo', 'coord@demo.com', '$2b$10$uQG6o6rYh1q8b3nQeKz0W.8Yy5Jq4Qn1R6v9y3FZQ8G7xY3f6bCq', 'coordinador');
GO


SELECT * FROM dicri.Usuario;


UPDATE dicri.Usuario
SET password_hash = '$2b$10$FTBBbbX2vrDZbr1pcXSm/.gWfRlqXUBCmpuVWqll6g9AYQpBMeT5e'
WHERE correo = 'tecnico@demo.com';


SELECT id, codigo_unico, descripcion
FROM dicri.Expediente;

SELECT * FROM dicri.Expediente;

