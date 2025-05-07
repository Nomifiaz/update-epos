import { Router } from 'express';
import upload from '../config/multer.js';
import * as deal from '../controllers/dealController.js';
import { authenticateToken } from '../middleware/authenticate.js';

const router = Router();

router.post('/', upload.single('image'), authenticateToken,deal.createDeal);
router.get('/', authenticateToken,deal.getDeals);
router.get('/:id', deal.getDealById);
router.put('/:id', upload.single('image'), authenticateToken,deal.updateDeal);
router.delete('/:id', authenticateToken,deal.deleteDeal);

export default router;
