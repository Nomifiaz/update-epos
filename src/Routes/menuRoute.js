import { Router } from 'express';
import * as menu from '../controllers/menuController.js';
import upload from '../config/multer.js';
import {authenticateToken} from '../middleware/authenticate.js';
const router = Router();

router.post('/', upload.single('image'), authenticateToken,menu.createMenu);
router.get('/',authenticateToken, menu.getMenu);
router.get('/:id', menu.getMenuById);
router.put('/:id', upload.single('image'),authenticateToken, menu.updateMenu);
router.delete('/:id',authenticateToken, menu.deleteMenu);

export default router;
