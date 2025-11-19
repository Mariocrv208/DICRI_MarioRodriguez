-- 2_init_users.sql
USE dicri_db2;
GO
INSERT INTO dicri2.Usuario (nombre, correo, password_hash, rol)
VALUES 
('Tecnico Demo', 'tecnico@demo.com', '$2b$10$FTBBbbX2vrDZbr1pcXSm/.gWfRlqXUBCmpuVWqll6g9AYQpBMeT5e', 'tecnico'), -- password: 'password123' hashed
('Coordinador Demo', 'coord@demo.com', '$2b$10$FTBBbbX2vrDZbr1pcXSm/.gWfRlqXUBCmpuVWqll6g9AYQpBMeT5e', 'coordinador');
GO


SELECT * FROM dicri2.Usuario;

SELECT * FROM dicri2.Expediente;

SELECT * FROM dicri2.Indicio;


UPDATE dicri.Usuario
SET password_hash = '$2b$10$FTBBbbX2vrDZbr1pcXSm/.gWfRlqXUBCmpuVWqll6g9AYQpBMeT5e'
WHERE correo = 'coord@demo.com';






