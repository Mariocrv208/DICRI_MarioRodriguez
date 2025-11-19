const express = require('express');
const router = express.Router();
const indicioController = require('../controllers/indicio.controller');
const auth = require('../middleware/auth');

router.post('/', auth.verifyToken, indicioController.createIndicio);

// **Nuevo endpoint: listar todos los indicios**
router.get('/', auth.verifyToken, indicioController.getIndicios);

// **Nuevo endpoint: obtener detalle de un indicio por ID**
router.get('/:id', auth.verifyToken, indicioController.getIndicioById);

module.exports = router;
