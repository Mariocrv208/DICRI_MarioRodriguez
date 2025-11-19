const express = require('express');
const router = express.Router();
const expedienteController = require('../controllers/expediente.controller');
const auth = require('../middleware/auth');

router.get('/', auth.verifyToken, expedienteController.getExpedientesWithUser);
router.get('/:id', auth.verifyToken, expedienteController.getExpedienteWithIndicios);
router.post('/', auth.verifyToken, expedienteController.createExpediente);

// enviar a revision (solo para no coordinadores)
router.put('/:id/revision', auth.verifyToken, expedienteController.submitForReview);

// aprobar/rechazar (solo coordinadores)
router.put('/:id/approve', auth.verifyToken, expedienteController.approveExpediente);
router.put('/:id/reject', auth.verifyToken, expedienteController.rejectExpediente);

// ruta opcional: updateRevision
router.put('/:id/update-revision', auth.verifyToken, expedienteController.updateRevision);

module.exports = router;
