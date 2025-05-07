import {Recipe, RecipeType,MenuType} from '../models/relations.js';
import User from '../models/userModel.js';

export const createRecipe = async (req, res) => {
    try {
        const {name, recipeTypeId, description} = req.body;
       
        const adminID = req.user.id; // Logged-in user ID
        if (!name || !recipeTypeId || !description) {
            return res
                .status(400)
                .json({success: false, message: 'All fields are required'});
        }

        const recipeType = await RecipeType.findByPk(recipeTypeId);
        if (!recipeType) {
            return res.status(404).json({
                success: false,
                message: 'Invalid recipeTypeId. RecipeType does not exist.',
            });
        }
        const newRecipe = await Recipe.create({
            name,
            recipeTypeId,
            description,
            createdBy: adminID,
        });

        res.status(200).json({
            success: true,
            message: 'Recipe created successfully',
            Recipe: newRecipe,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error creating Recipe',
            error: error.message,
        });
    }
};

export const getRecipe = async (req, res) => {
    try {
        const userID = req.user.id;
        const userRole = req.user.role;

        let recipes;

        if (userRole === 'admin' || userRole === 'superAdmin') {
            // Admin gets only menu types they created
            recipes = await Recipe.findAll({ where: { createdBy: userID } });
        } else if (userRole === 'cashier') {
            // Cashier gets menu types created by their admin
            const cashier = await User.findOne({ where: { id: userID } });

            if (!cashier || !cashier.addedBy) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            recipes = await Recipe.findAll({ where: { createdBy: cashier.addedBy } });
        } else {
            return res.status(403).json({ message: 'Unauthorized role' });
        }

        res.status(200).json({
            success: true,
            message: ' successfully',
            recipes,
        });;
    } catch (error) {
        res.status(500).json({ message: 'Error fetching recipe', error: error.message });
    }
};


export const getRecipeById = async (req, res) => {
    try {
        const {id} = req.params;
        const recipe = await Recipe.findByPk(id);
        if (!recipe) {
            return res
                .status(404)
                .json({success: false, message: 'Recipe not found'});
        }
        res.status(200).json({
            success: true,
            message: 'Recipe retrieved successfully',
            recipe,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving Recipe',
            error: error.message,
        });
    }
};

export const updateRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, recipeTypeId, description } = req.body;
        const userID = req.user.id; // Logged-in user ID

        const recipe = await Recipe.findByPk(id);
        if (!recipe) {
            return res.status(404).json({ success: false, message: 'Recipe not found' });
        }

        // Check if the logged-in user is the creator of the recipe
        if (recipe.createdBy !== userID) {
            return res.status(403).json({ success: false, message: 'Unauthorized to update this recipe' });
        }

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (recipeTypeId !== undefined) {
            const recipeType = await RecipeType.findByPk(recipeTypeId);
            if (!recipeType) {
                return res.status(404).json({ success: false, message: 'Invalid recipeTypeId. RecipeType does not exist.' });
            }
            updates.recipeTypeId = recipeTypeId;
        }
        if (description !== undefined) updates.description = description;

        await recipe.update(updates);

        res.status(200).json({ success: true, message: 'Recipe updated successfully', recipe });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error updating Recipe', error: error.message });
    }
};

export const deleteRecipe = async (req, res) => {
    try {
        const { id } = req.params;
        const userID = req.user.id; // Logged-in user ID

        const recipe = await Recipe.findByPk(id);
        if (!recipe) {
            return res.status(404).json({ success: false, message: 'Recipe not found' });
        }

        // Check if the logged-in user is the creator of the recipe
        if (recipe.createdBy !== userID) {
            return res.status(403).json({ success: false, message: 'Unauthorized to delete this recipe' });
        }

        await recipe.destroy();

        res.status(200).json({ success: true, message: 'Recipe deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error deleting Recipe', error: error.message });
    }
};
