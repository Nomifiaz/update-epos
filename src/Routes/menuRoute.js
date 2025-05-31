import { Router } from 'express';
import * as menu from '../controllers/menuController.js';
import upload from '../config/multer.js';
import {authenticateToken} from '../middleware/authenticate.js';
import { checkPermission } from '../middleware/checkDynamicPermission.js';
const router = Router();

router.post('/', upload.single('image'), authenticateToken,checkPermission("addMenu","menuSetting"),menu.createMenu);
router.get('/',authenticateToken,checkPermission("viewMenu","menuSetting"), menu.getMenu);
router.get('/:id', menu.getMenuById);
router.put('/:id', upload.single('image'),authenticateToken,checkPermission("UpdateMenu","menuSetting"), menu.updateMenu);
router.delete('/:id',authenticateToken,checkPermission("deleteMenu","menuSetting"), menu.deleteMenu);

export default router;
