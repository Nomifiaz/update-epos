import path from 'path';
import {Menu, MenuType} from '../models/relations.js';
import User from '../models/userModel.js';

export const createMenu = async (req, res) => {
    try {
        const {name, description, menuTypeId, status} = req.body;
        const adminID = req.user.id; // Logged-in user ID

        // Check if user is an admin
        if (req.user.role !== 'admin' && req.user.role !== 'superAdmin') {
            return res.status(403).json({ message: 'Unauthorized to create a menu' });
        }

        if (!name || !description || !menuTypeId) {
            return res
                .status(400)
                .json({success: false, message: 'All fields are required'});
        }
        const menuType = await MenuType.findByPk(menuTypeId);
        if (!menuType) {
            return res.status(404).json({
                success: false,
                message: 'Invalid menuTypeId. MenuType does not exist.',
            });
        }
        const newMenu = await Menu.create({
            name,
            description,
            menuTypeId,
            status,
            createdBy: adminID 
        });
        if (newMenu && req.file) {
            const imageUrl = `/uploads/${path.basename(req.file.path)}`;
            await newMenu.update({image: imageUrl});
        }
        res.status(201).json({
            success: true,
            message: 'Menu created successfully',
            menu: newMenu,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error creating menu',
            error: error.message,
        });
    }
};

export const getMenu = async (req, res) => {
    try {
        const userID = req.user.id;
        const userRole = req.user.role;

        let menu;

        if (userRole === 'admin' || userRole === 'superAdmin') {
            // Admin gets only menu types they created
            menu = await Menu.findAll({ where: { createdBy: userID } });
        } else if (userRole === 'cashier') {
            // Cashier gets menu types created by their admin
            const cashier = await User.findOne({ where: { id: userID } });

            if (!cashier || !cashier.addedBy) {
                return res.status(403).json({ message: 'Unauthorized' });
            }

            menu = await Menu.findAll({ where: { createdBy: cashier.addedBy } });
        } else {
            return res.status(403).json({ message: 'Unauthorized role' });
        }

        res.status(200).json({
            success: true,
            message: ' successfully',
            menu,
        });;
    } catch (error) {
        res.status(500).json({ message: 'Error fetching menu types', error: error.message });
    }
};



export const getMenuById = async (req, res) => {
    try {
        const {id} = req.params;
        const menu = await Menu.findByPk(id);
        if (!menu) {
            return res
                .status(404)
                .json({success: false, message: 'Menu not found'});
        }
        res
            .status(200)
            .json({success: true, message: 'Menu retrieved successfully', menu});
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving menu',
            error: error.message,
        });
    }
};

export const updateMenu = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, menuTypeId, status } = req.body;
        const userID = req.user.id; // Logged-in user ID

        const menu = await Menu.findByPk(id);
        if (!menu) {
            return res.status(404).json({ success: false, message: 'Menu not found' });
        }

        // Check if the logged-in user is the creator of the menu
        if (menu.createdBy !== userID) {
            return res.status(403).json({ success: false, message: 'Unauthorized to update this Menu' });
        }

        if (menuTypeId) {
            const menuType = await MenuType.findByPk(menuTypeId);
            if (!menuType) {
                return res.status(404).json({
                    success: false,
                    message: 'Invalid menuTypeId. MenuType does not exist.',
                });
            }
        }

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (menuTypeId !== undefined) updates.menuTypeId = menuTypeId;
        if (status !== undefined) updates.status = status;
        if (req.file) updates.image = `/uploads/${path.basename(req.file.path)}`;

        await menu.update(updates);

        res.status(200).json({
            success: true,
            message: 'Menu updated successfully',
            menu,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error updating menu',
            error: error.message,
        });
    }
};

export const deleteMenu = async (req, res) => {
    try {
        const { id } = req.params;
        const userID = req.user.id; // Logged-in user ID

        const menu = await Menu.findByPk(id);
        if (!menu) {
            return res.status(404).json({ success: false, message: 'Menu not found' });
        }

        // Check if the logged-in user is the creator of the menu
        if (menu.createdBy !== userID) {
            return res.status(403).json({ success: false, message: 'Unauthorized to delete this Menu' });
        }

        await menu.destroy();
        res.status(200).json({ success: true, message: 'Menu deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Error deleting menu',
            error: error.message,
        });
    }
};
