import { Router } from 'express';
import * as recipieType from '../controllers/recipeTypeController.js';
import { authenticateToken } from '../middleware/authenticate.js';
import { checkPermission } from '../middleware/checkDynamicPermission.js';
const router = Router();

router.post('/recipe-types', authenticateToken,checkPermission("addRecipetype","menuSetting"),recipieType.createRecipeType);
router.get('/recipe-types', authenticateToken,checkPermission("viewRecipetype","menuSetting"),recipieType.getRecipeType);
router.get('/recipe-types/:id', recipieType.getRecipeTypeById);
router.put('/recipe-types/:id', authenticateToken,checkPermission("updateRecipetype","menuSetting"),recipieType.updateRecipeType);
router.delete('/recipe-types/:id', authenticateToken,checkPermission("deleteRecipetype","menuSetting"),recipieType.deleteRecipeType);

export default router;
