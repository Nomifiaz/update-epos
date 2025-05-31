import { Router } from 'express';
import * as menuType from '../controllers/menuTypeController.js';
import { authenticateToken } from '../middleware/authenticate.js';
import { checkPermission } from '../middleware/checkDynamicPermission.js';
const router = Router();

router.post('/menu-types',authenticateToken,checkPermission("addMenuetype","menuSetting"), menuType.createMenuType);
router.get('/menu-types', authenticateToken,checkPermission("viewMenuetype", "menuSetting"),menuType.getMenuTypesForUser);
router.get('/menu-types/:id', menuType.getMenuTypeById);
router.put('/menu-types/:id', authenticateToken,checkPermission("updateMenuetype","menuSetting"),menuType.updateMenuType);
router.delete('/menu-types/:id', authenticateToken,checkPermission("deleteMenuetype","menuSetting"),menuType.deleteMenuType);

export default router;
