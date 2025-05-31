import { Router } from 'express';
import upload from '../config/multer.js';
import * as menuItem from '../controllers/menuItemController.js';
import { authenticateToken } from '../middleware/authenticate.js';
import { checkPermission } from '../middleware/checkDynamicPermission.js';

const router = Router();

router.post('/', upload.single('image'),authenticateToken, checkPermission("addMenueitem","menuSetting"),menuItem.createMenuItem);
router.get('/',authenticateToken, checkPermission("viewMenueitem","menuSetting"),menuItem.getMenuItems);
router.get('/:id', menuItem.getMenuItemById);
router.put('/:id', upload.single('image'),authenticateToken,checkPermission("updateMenueitem","menuSetting") ,menuItem.updateMenuItem);
router.delete('/:id',authenticateToken, checkPermission("deleteMenueitem","menuSetting"),menuItem.deleteMenuItem);

export default router;
