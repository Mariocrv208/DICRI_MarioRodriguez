const express = require('express');
const router = express.Router();
const indicioController = require('../controllers/indicio.controller');
const auth = require('../middleware/auth');

router.post('/', auth.verifyToken, indicioController.createIndicio);

// listar todos los indicios
router.get('/', auth.verifyToken, indicioController.getIndicios);

// obtener detalle de un indicio por ID
router.get('/:id', auth.verifyToken, indicioController.getIndicioById);

router.get('/', auth.verifyToken, indicioController.getAllIndicios);

router.delete("/:id", auth.verifyToken, indicioController.deleteIndicio);

module.exports = router;
