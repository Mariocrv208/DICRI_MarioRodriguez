// backend/routes/dashboard.js
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");

router.get('/expedientes-estado', dashboardController.getExpedientesEstado);
router.get('/indicios-expediente', dashboardController.getIndiciosPorExpediente);
router.get('/expedientes-usuario', dashboardController.getExpedientesPorUsuario);
router.get('/expedientes-coordinador', dashboardController.getExpedientesPorCoordinador);
router.get('/expedientes-mes', dashboardController.getExpedientesPorMes);

module.exports = router;
