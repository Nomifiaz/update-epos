import { Router } from 'express';
import * as recipe from '../controllers/recipeController.js';
import { authenticateToken } from '../middleware/authenticate.js';
import { checkPermission } from '../middleware/checkDynamicPermission.js';

const router = Router();

router.post('/',authenticateToken, checkPermission("addRecipe","menuSetting"),recipe.createRecipe);
router.get('/', authenticateToken,checkPermission("viewRecipe","menuSetting"),recipe.getRecipe);
router.get('/:id', recipe.getRecipeById);
router.put('/:id', authenticateToken,checkPermission("updateRecipe","menuSetting"),recipe.updateRecipe);
router.delete('/:id', authenticateToken,checkPermission("deleteRecipe","menuSetting"),recipe.deleteRecipe);

export default router;
