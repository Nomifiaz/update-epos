import {Recipe, RecipeType,MenuType} from '../models/relations.js';
import User from '../models/userModel.js';
import InventoryItem from '../models/inventoryItem.js';
import recipeitem from '../models/recipeitem.js';
import Role from '../models/role.js';


export const createRecipe = async (req, res) => {
  try {
    const { name, recipeTypeId, description, items } = req.body; // items = [{ InventoryItemid, quantity }]
    const adminID = req.user.id;
    
    if (!name || !recipeTypeId  || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All fields and at least one inventory item are required.'
      });
    }

    const recipeType = await RecipeType.findByPk(recipeTypeId);
    if (!recipeType) {
      return res.status(404).json({ success: false, message: 'Invalid recipeTypeId' });
    }

    let totalCost = 0;
    const recipeItemsData = [];

    for (const item of items) {
      const { InventoryItemid, quantity } = item;

      if (!InventoryItemid || !quantity) {
        return res.status(400).json({ success: false, message: 'Each item must have InventoryItemid and quantity' });
      }

      const inventoryItem = await InventoryItem.findOne({ where: { id: InventoryItemid } });
      if (!inventoryItem) {
        return res.status(404).json({ success: false, message: `Inventory item not found: ${InventoryItemid}` });
      }

      const { lastPurchasePrice, perPurchase } = inventoryItem;

      if (!lastPurchasePrice || !perPurchase) {
        return res.status(400).json({
          success: false,
          message: `Missing price/perPurchase for item ${InventoryItemid}`
        });
      }

      const unitCost = lastPurchasePrice / perPurchase;
      const itemCost = unitCost * quantity;
      totalCost += itemCost;

      recipeItemsData.push({
        inventoryItemId: InventoryItemid,
        quantity,
        unitCost,
        totalCost: itemCost
      });
    }

    const newRecipe = await Recipe.create({
      name,
      recipeTypeId,
      description,
      createdBy: adminID,
      cost: totalCost
    });

    // Save recipe items
    for (const item of recipeItemsData) {
      await recipeitem.create({
        recipeId: newRecipe.id,
        inventoryItemId: item.inventoryItemId,
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost: item.totalCost
      });
    }

    res.status(200).json({
      success: true,
      message: 'Recipe created with multiple ingredients.',
      recipe: newRecipe
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error creating recipe',
      error: error.message
    });
  }
};



export const getRecipe = async (req, res) => {
  try {
    const userID = req.user.id;

    // Get the user and their role
    const user = await User.findOne({
      where: { id: userID },
      include: {
        model: Role,
        attributes: ['name'],
      },
    });

    if (!user || !user.role) {
      return res.status(404).json({ message: 'User or role not found' });
    }

    const userRole = user.role.name;
    let allCreatedByIds = [];

    if (userRole === 'admin') {
      const managers = await User.findAll({
        where: { addedBy: userID },
        include: {
          model: Role,
          where: { name: 'manager' },
          attributes: [],
        },
        attributes: ['id'],
      });
      const managerIds = managers.map((m) => m.id);

      const cashiers = await User.findAll({
        where: { addedBy: managerIds },
        include: {
          model: Role,
          where: { name: 'cashier' },
          attributes: [],
        },
        attributes: ['id'],
      });
      const cashierIds = cashiers.map((c) => c.id);

      allCreatedByIds = [userID, ...managerIds, ...cashierIds];

    } else if (userRole === 'manager') {
      const cashierList = await User.findAll({
        where: { addedBy: userID },
        include: {
          model: Role,
          where: { name: 'cashier' },
          attributes: [],
        },
        attributes: ['id'],
      });
      const cashierIds = cashierList.map((c) => c.id);

      const adminId = user.addedBy;

      allCreatedByIds = [adminId, userID, ...cashierIds];

    } else if (userRole === 'cashier') {
      const manager = await User.findOne({ where: { id: user.addedBy } });

      if (!manager) {
        return res.status(403).json({ message: 'Manager not found for this cashier' });
      }

      const adminId = manager.addedBy;

      allCreatedByIds = [userID, user.addedBy, adminId];
    } else {
      return res.status(403).json({ message: 'Unauthorized role' });
    }

    const recipes = await Recipe.findAll({
  where: { createdBy: allCreatedByIds },
  attributes: {
    exclude: ['description'], 
  },
  include: [],
});


    res.status(200).json({
      success: true,
      message: 'Fetched recipes successfully',
      recipes,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching recipes',
      error: error.message,
    });
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

        const recipe = await Recipe.findByPk(id);
        if (!recipe) {
            return res.status(404).json({ success: false, message: 'Recipe not found' });
        }

        await recipe.destroy();

        res.status(200).json({ success: true, message: 'Recipe deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error deleting Recipe', error: error.message });
    }
};
