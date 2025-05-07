import { Router } from 'express';
import * as auth from '../controllers/authController.js';
import createCashier from '../controllers/cashierRegister.js';
import { authenticateToken } from '../middleware/authenticate.js';

const router = Router();

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/reset-password', auth.resetPassword);
router.post("/add",authenticateToken,createCashier)

export default router;
