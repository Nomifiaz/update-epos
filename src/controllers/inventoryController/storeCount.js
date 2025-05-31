import StoreStock from "../../models/storeStock.js";
import {
  
    InventoryItem,
    InventoryCatagory,
   
  } from '../../models/inventeryRelations.js';
export const getStoreCount = async (req, res) => {
  try {
    const createdBy = req.user.id;
    const storeCount = await StoreStock.findAll({
        where: {
          createdBy: createdBy,
        },
      include: [
        {
          model: InventoryItem,
            as: "InventoryItem",
          attributes: ["name", "purchaseUnitId", "lastPurchasePrice", "categoryId"],
          include: [
            {
              model: InventoryCatagory,
                as: "category",
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    // Transform the response to include total stock price
    const enrichedData = storeCount.map(item => {
      const quantity = parseFloat(item.quantity);
      const purchasePrice = parseFloat(item.InventoryItem?.lastPurchasePrice || 0);
      const totalPrice = quantity * purchasePrice;

      return {
        id: item.id,
        inventoryItemId: item.inventoryItemId,
        inventoryItemName: item.InventoryItem?.name || '',
        categoryId: item.InventoryItem?.categoryId || null,
        quantity,
        totalPrice: totalPrice.toFixed(2),
        itemName: item.InventoryItem?.name || '',
        unit: item.InventoryItem?.unit || '',
        categoryName: item.InventoryItem?.category?.name || '',
        lastPurchasePrice: purchasePrice,
      };
    });

    res.status(200).json({
      success: true,
      message: "Store count retrieved successfully",
      data: enrichedData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error retrieving store count",
      error: error.message,
    });
  }
};
