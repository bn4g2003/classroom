const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/createAccessCode', authController.createAccessCode);
router.post('/validateAccessCode', authController.validateAccessCode);
router.post('/loginEmail', authController.loginEmail);
router.post('/validateEmailCode', authController.validateEmailCode);

module.exports = router;