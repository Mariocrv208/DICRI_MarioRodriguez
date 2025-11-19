const express = require('express');
const router = express.Router();
const expedienteController = require('../controllers/expediente.controller');
const auth = require('../middleware/auth');

router.get('/', auth.verifyToken, expedienteController.getExpedientes); // GET todos los expedientes
router.get('/:id', auth.verifyToken, expedienteController.getExpedienteWithIndicios); // GET detalle de expediente
router.post('/', auth.verifyToken, expedienteController.createExpediente); // Crear expediente

module.exports = router;
