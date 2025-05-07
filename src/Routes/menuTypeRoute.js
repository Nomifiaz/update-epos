import { Router } from 'express';
import * as menuType from '../controllers/menuTypeController.js';
import { authenticateToken } from '../middleware/authenticate.js';
const router = Router();

router.post('/menu-types',authenticateToken, menuType.createMenuType);
router.get('/menu-types', authenticateToken,menuType.getMenuTypesForUser);
router.get('/menu-types/:id', menuType.getMenuTypeById);
router.put('/menu-types/:id', authenticateToken,menuType.updateMenuType);
router.delete('/menu-types/:id', authenticateToken,menuType.deleteMenuType);

export default router;
