import path from 'path';
import {MenuItem, Menu, Recipe} from '../models/relations.js';
import User from '../models/userModel.js';


export const createMenuItem = async (req, res) => {
    const { menuId, recipeId, name, basePrice, smallPrice, mediumPrice, largePrice } = req.body;
    const adminID = req.user.id;

    if (!menuId || !recipeId || !name) {
        return res.status(400).json({
            success: false,
            message: "Menu ID, Recipe ID, and Name are required",
        });
    }

    if (!basePrice && !smallPrice && !mediumPrice && !largePrice) {
        return res.status(400).json({
            success: false,
            message: "At least one price (basePrice, smallPrice, mediumPrice, largePrice) must be provided",
        });
    }

    try {
        const menu = await Menu.findByPk(menuId);
        if (!menu) {
            return res.status(404).json({
                success: false,
                message: "Invalid menuId. Menu does not exist.",
            });
        }

        const recipe = await Recipe.findByPk(recipeId);
        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: "Invalid recipeId. Recipe does not exist.",
            });
        }

        const menuItem = await MenuItem.create({
            menuId,
            recipeId,
            name,
            basePrice: basePrice || null,
            smallPrice: smallPrice || null,
            mediumPrice: mediumPrice || null,
            largePrice: largePrice || null,
            createdBy: adminID
        });

        if (menuItem && req.file) {
            const imageUrl = `/uploads/${path.basename(req.file.path)}`;
            await menuItem.update({ image: imageUrl });
        }

        res.status(201).json({
            success: true,
            message: "MenuItem created successfully",
            menuItem,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error creating menu item",
            error: error.message,
        });
    }
};



export const getMenuItems = async (req, res) => {
    try {
        const userID = req.user.id;
        const userRole = req.user.role;

        let whereCondition = {};

        if (userRole === 'admin' || userRole === 'superAdmin') {
            // Admin gets only menu items they created
            whereCondition = { createdBy: userID };
        } else if (userRole === 'cashier') {
            // Cashier gets menu items created by their admin
            const cashier = await User.findOne({ where: { id: userID } });

            if (!cashier || !cashier.addedBy) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            whereCondition = { createdBy: cashier.addedBy };
        } else {
            return res.status(403).json({ message: 'Unauthorized role' });
        }

        // Fetch menu items with menu name and recipe name
        const menuItems = await MenuItem.findAll({
            where: whereCondition,
            include: [
                {
                    model: Menu,
                    attributes: ['name'], // Get only the name of the menu
                },
                {
                    model: Recipe,
                    attributes: ['name'], // Get only the name of the recipe
                }
            ]
        });

        res.status(200).json({
            success: true,
            message: 'Menu items fetched successfully',
            menuItems,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching menu items', error: error.message });
    }
};

export const getMenuItemById = async (req, res) => {
    const {id} = req.params;

    try {
        const menuItem = await MenuItem.findByPk(id);

       

        res.status(200).json({
            success: true,
            message: 'Menu item retrieved successfully',
            menuItem,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving menu item',
            error: error.message,
        });
    }
};

export const updateMenuItem = async (req, res) => {
    const { id } = req.params;
    const { menuId, recipeId, price, status, name } = req.body;
    const userID = req.user.id;

    try {
        const menuItem = await MenuItem.findByPk(id);
        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found',
            });
        }
        if (menuItem.createdBy !== userID) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: You can only update menu items you created',
            });
        }
        const updates = {};
        if (menuId !== undefined) updates.menuId = menuId;
        if (recipeId !== undefined) updates.recipeId = recipeId;
        if (price !== undefined) updates.price = price;
        if (status !== undefined) updates.status = status;
        if (name !== undefined) updates.name = name;
        if (req.file) updates.image = `/uploads/${path.basename(req.file.path)}`;

        await menuItem.update(updates);

        res.status(200).json({
            success: true,
            message: 'Menu item updated successfully',
            menuItem,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error updating menu item',
            error: error.message,
        });
    }
};

export const deleteMenuItem = async (req, res) => {
    const { id } = req.params;
    const userID = req.user.id;

    try {
        const menuItem = await MenuItem.findByPk(id);
        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found',
            });
        }
        if (menuItem.createdBy !== userID) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: You can only delete menu items you created',
            });
        }
        await menuItem.destroy();
        res.status(200).json({
            success: true,
            message: 'Menu item deleted successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error deleting menu item',
            error: error.message,
        });
    }
};
