// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/logout', authController.logout);
// A rota de profile é protegida pelo middleware
router.get('/profile', authController.protect, authController.getProfile);

module.exports = router;
