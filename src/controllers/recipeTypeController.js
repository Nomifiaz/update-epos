import {RecipeType} from '../models/relations.js';
import User from '../models/userModel.js';

export const createRecipeType = async (req, res) => {
    try {
        const {name} = req.body;
        const adminID = req.user.id;
        if (!name) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: 'Please provide name of recipe type',
                });
        }
        const recipeType = await RecipeType.findOne({where: {name}});
        if (recipeType) {
            return res
                .status(409)
                .json({success: false, message: 'Recipe type already exists'});
        }

        const newRecipeType = await RecipeType.create({name,createdBy: adminID });

        res.status(201).json({
            success: true,
            message: 'RecipeType created successfully',
            recipeType: newRecipeType,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error creating recipe type',
            error: error.message,
        });
    }
};

export const getRecipeType = async (req, res) => {
    try {
        const userID = req.user.id;
        const userRole = req.user.role;

        let recipeTypes;

        if (userRole === 'admin' || userRole === 'superAdmin') {
            // Admin gets only menu types they created
            recipeTypes = await RecipeType.findAll({ where: { createdBy: userID } });
        } else if (userRole === 'cashier') {
            // Cashier gets menu types created by their admin
            const cashier = await User.findOne({ where: { id: userID } });

            if (!cashier || !cashier.addedBy) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            recipeTypes = await RecipeType.findAll({ where: { createdBy: cashier.addedBy } });
        } else {
            return res.status(403).json({ message: 'Unauthorized role' });
        }

        res.status(200).json({
            success: true,
            message: ' successfully',
            recipeTypes,
        });;;
    } catch (error) {
        res.status(500).json({ message: 'Error fetching recipe', error: error.message });
    }
}


export const getRecipeTypeById = async (req, res) => {
    try {
        const {id} = req.params;
        const recipeType = await RecipeType.findByPk(id);
        if (!recipeType) {
            return res
                .status(404)
                .json({success: false, message: 'RecipeType not found'});
        }
        res.status(200).json({
            success: true,
            message: 'RecipeType retrieved successfully',
            recipeType,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving RecipeType',
            error: error.message,
        });
    }
};

export const updateRecipeType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const userID = req.user.id; // Logged-in user ID

        if (!name || !id) {
            return res.status(400).json({
                success: false,
                message: 'Provide name and ID of RecipeType',
            });
        }

        const recipeType = await RecipeType.findByPk(id);
        if (!recipeType) {
            return res.status(404).json({ success: false, message: 'RecipeType not found' });
        }

        // Check if the logged-in user is the creator of the recipe type
        if (recipeType.createdBy !== userID) {
            return res.status(403).json({ success: false, message: 'Unauthorized to update this RecipeType' });
        }

        await recipeType.update({ name });

        res.status(200).json({
            success: true,
            message: 'RecipeType updated successfully',
            recipeType,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error updating RecipeType',
            error: error.message,
        });
    }
};

export const deleteRecipeType = async (req, res) => {
    try {
        const { id } = req.params;
        const userID = req.user.id; // Logged-in user ID

        if (!id) {
            return res.status(400).json({ success: false, message: 'Provide ID of RecipeType' });
        }

        const recipeType = await RecipeType.findByPk(id);
        if (!recipeType) {
            return res.status(404).json({ success: false, message: 'RecipeType not found' });
        }

        // Check if the logged-in user is the creator of the recipe type
        if (recipeType.createdBy !== userID) {
            return res.status(403).json({ success: false, message: 'Unauthorized to delete this RecipeType' });
        }

        await recipeType.destroy();

        res.status(200).json({
            success: true,
            message: 'RecipeType deleted successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error deleting RecipeType',
            error: error.message,
        });
    }
};
