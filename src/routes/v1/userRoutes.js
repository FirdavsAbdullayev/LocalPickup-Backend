const express = require('express');
const authController = require('../../controllers/authController');
const { protect } = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { registerSchema, loginSchema } = require('../../config/validations');
const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', protect, authController.getMe);
router.patch('/me', protect, authController.updateMe);

module.exports = router;
