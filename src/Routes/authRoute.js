import { Router } from 'express';
import * as auth from '../controllers/authController.js';
import createCashier from '../controllers/cashierRegister.js';
import { authenticateToken } from '../middleware/authenticate.js';
import createAdmin from '../controllers/managerCreate.js';
import createManager from '../controllers/managerCreate.js';
import { checkPermission } from '../middleware/checkDynamicPermission.js';


const router = Router();

router.post('/register', auth.register);
router.post('/login', auth.login);
router.post('/reset-password', auth.resetPassword);
router.post("/add",authenticateToken,createCashier)

//admin
router.post("/adminRegister",authenticateToken,checkPermission('admin_create'),createAdmin)
router.post("/managerRegister",authenticateToken,checkPermission('manager_create'),createManager)
export default router;
