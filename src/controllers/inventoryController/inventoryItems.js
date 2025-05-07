import{InventoryItem,
  InventoryCatagory,
  Units} from '../../models/inventeryRelations.js';
import { Op } from 'sequelize';

export const createInventoryItem = async (req, res) => {
  try {
    const {
      name,
      code,
      categoryId,
      minQty,
      purchaseUnitId,
      saleUnitId,
      lastPurchasePrice
    } = req.body;

    const createdBy = req.user.id;

    if (!name || !categoryId || !purchaseUnitId || !saleUnitId) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const item = await InventoryItem.create({
      name,
      code,
      categoryId,
      minQty,
      purchaseUnitId,
      saleUnitId,
      lastPurchasePrice,
      createdBy
    });

    res.status(201).json({ message: 'Inventory item created successfully', item });
  } catch (error) {
    res.status(500).json({ message: 'Error creating inventory item', error: error.message });
  }
};

// Get all inventory items

export const getAllInventoryItems = async (req, res) => {
  try {
    const createdBy = req.user.id;

    const items = await InventoryItem.findAll({
      where: { createdBy },
      attributes: ["id","code", "name", "minQty", "lastPurchasePrice"],
      include: [
        {
          model: InventoryCatagory,
          as: "category",
          attributes: ["name"]
        },
        {
          model: Units,
          as: "purchaseUnit",
          attributes: ["name"]
        },
        {
          model: Units,
          as: "saleUnit",
          attributes: ["name"]
        }
      ]
    });

    // Format the response
    const formattedItems = items.map(item => ({
      code: item.code,
      id: item.id,
      name: item.name,
      minQty: item.minQty,
      lastPurchasePrice: item.lastPurchasePrice,
      categoryName: item.category?.name || null,
      purchaseUnitName: item.purchaseUnit?.name || null,
      saleUnitName: item.saleUnit?.name || null
    }));

    res.status(200).json({
      message: "Items fetched successfully",
      items: formattedItems
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching items",
      error: error.message
    });
  }
};



export const getInventoryItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await InventoryItem.findByPk(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json({ message: 'Item fetched successfully', item });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching item', error: error.message });
  }
};

export const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      code,
      categoryId,
      minQty,
      purchaseUnitId,
      saleUnitId,
      lastPurchasePrice
    } = req.body;

    const item = await InventoryItem.findByPk(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await item.update({
      name,
      code,
      categoryId,
      minQty,
      purchaseUnitId,
      saleUnitId,
      lastPurchasePrice
    });

    res.status(200).json({ message: 'Item updated successfully', item });
  } catch (error) {
    res.status(500).json({ message: 'Error updating item', error: error.message });
  }
};

export const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await InventoryItem.findByPk(id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    await item.destroy();
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting item', error: error.message });
  }
};
