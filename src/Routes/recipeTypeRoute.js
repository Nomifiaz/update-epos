import { Router } from 'express';
import * as recipieType from '../controllers/recipeTypeController.js';
import { authenticateToken } from '../middleware/authenticate.js';
const router = Router();

router.post('/recipe-types', authenticateToken,recipieType.createRecipeType);
router.get('/recipe-types', authenticateToken,recipieType.getRecipeType);
router.get('/recipe-types/:id', recipieType.getRecipeTypeById);
router.put('/recipe-types/:id', authenticateToken,recipieType.updateRecipeType);
router.delete('/recipe-types/:id', authenticateToken,recipieType.deleteRecipeType);

export default router;
