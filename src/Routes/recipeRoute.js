import { Router } from 'express';
import * as recipe from '../controllers/recipeController.js';
import { authenticateToken } from '../middleware/authenticate.js';

const router = Router();

router.post('/',authenticateToken, recipe.createRecipe);
router.get('/', authenticateToken,recipe.getRecipe);
router.get('/:id', recipe.getRecipeById);
router.put('/:id', authenticateToken,recipe.updateRecipe);
router.delete('/:id', authenticateToken,recipe.deleteRecipe);

export default router;
