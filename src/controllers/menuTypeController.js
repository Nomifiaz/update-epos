//import {MenuType} from '../models/relations.js';

import MenuType from '../models/menuTypeModel.js';
import Recipe from '../models/recipeModel.js';

import User from '../models/userModel.js';

export  const createMenuType = async (req, res) => {
    try {
        const { name } = req.body;
        const adminID = req.user.id; // Logged-in user ID

        // Check if user is an admin
        if (req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
            return res.status(403).json({ message: 'Unauthorized to create a menu type' });
        }

        // Create a menu type
        const menuType = await MenuType.create({ name, createdBy: adminID });

        res.status(201).json({ message: 'Menu type created successfully', menuType });
    } catch (error) {
        res.status(500).json({ message: 'Error creating menu type', error: error.message });
    }
};


export const getMenuTypesForUser = async (req, res) => {
    try {
        const userID = req.user.id;
        const userRole = req.user.role;

        let menuTypes;

        if (userRole === 'admin' || userRole === 'superAdmin') {
            // Admin gets only menu types they created
            menuTypes = await MenuType.findAll({ where: { createdBy: userID } });
        } else if (userRole === 'cashier') {
            // Cashier gets menu types created by their admin
            const cashier = await User.findOne({ where: { id: userID } });

            if (!cashier || !cashier.addedBy) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            menuTypes = await MenuType.findAll({ where: { createdBy: cashier.addedBy } });
        } else {
            return res.status(403).json({ message: 'Unauthorized role' });
        }

        res.status(200).json({
            success: true,
            message: ' successfully',
            menuTypes,
        });;
    } catch (error) {
        res.status(500).json({ message: 'Error fetching menu types', error: error.message });
    }
};




export const getMenuTypeById = async (req, res) => {
    try {
        const {id} = req.params;
        const menuType = await MenuType.findByPk(id);
        if (!menuType) {
            return res
                .status(404)
                .json({success: false, message: 'MenuType not found'});
        }
        res.status(200).json({
            success: true,
            message: 'MenuType retrieved successfully',
            menuType,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving MenuType',
            error: error.message,
        });
    }
};

export const updateMenuType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const userID = req.user.id;

        if (!id || !name) {
            return res.status(400).json({ success: false, message: 'Provide id and name' });
        }
        
        const menuType = await MenuType.findByPk(id);
        if (!menuType) {
            return res.status(404).json({ success: false, message: 'MenuType not found' });
        }
        
        // Ensure only the creator can update
        if (menuType.createdBy !== userID) {
            return res.status(403).json({ success: false, message: 'Unauthorized to update this MenuType' });
        }
        
        await menuType.update({ name });

        res.status(200).json({
            success: true,
            message: 'MenuType updated successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error updating MenuType',
            error: error.message,
        });
    }
};

export const deleteMenuType = async (req, res) => {
    try {
        const { id } = req.params;
        const userID = req.user.id;
        console.log("Received ID:", id);
      
        const menuType = await MenuType.findByPk(id);
        if (!menuType) {
            return res.status(404).json({ success: false, message: 'MenuType not found' });
        }

        // Ensure only the creator can delete
        if (menuType.createdBy !== userID) {
            return res.status(403).json({ success: false, message: 'Unauthorized to delete this MenuType' });
        }

        await menuType.destroy();

        res.status(200).json({
            success: true,
            message: 'MenuType deleted successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error deleting MenuType',
            error: error.message,
        });
    }
};
