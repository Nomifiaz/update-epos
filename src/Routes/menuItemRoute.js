import { Router } from 'express';
import upload from '../config/multer.js';
import * as menuItem from '../controllers/menuItemController.js';
import { authenticateToken } from '../middleware/authenticate.js';

const router = Router();

router.post('/', upload.single('image'),authenticateToken, menuItem.createMenuItem);
router.get('/',authenticateToken, menuItem.getMenuItems);
router.get('/:id', menuItem.getMenuItemById);
router.put('/:id', upload.single('image'),authenticateToken, menuItem.updateMenuItem);
router.delete('/:id',authenticateToken, menuItem.deleteMenuItem);

export default router;
