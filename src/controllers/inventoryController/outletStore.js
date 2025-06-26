import StoreStock from "../../models/storeStock.js";
import {
  
    InventoryItem,
    InventoryCatagory,
    Outlet,
    Units,
  
   
  } from '../../models/inventeryRelations.js';
import OutletCount from "../../models/outletCount.js";
import User from "../../models/userModel.js"
import Role from "../../models/role.js";
export const getOutletCount = async (req, res) => {
  try {
    const userID = req.user.id;

    // Fetch user with role
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
    let outletFilter = {};

    if (userRole === 'admin') {
      // Admin: no filter (show all outlet counts)
      outletFilter = {};
    } else if (userRole === 'manager') {
      // Manager: show outlet counts for outlets where managerId is current user
      outletFilter = { managerId: userID };
    } else if (userRole === 'cashier') {
      // Cashier: find manager and show outlet counts for manager's outlets
      const manager = await User.findOne({ where: { id: user.addedBy } });
      if (!manager) {
        return res.status(403).json({ message: 'Manager not found for this cashier' });
      }
      outletFilter = { managerId: manager.id };
    } else {
      return res.status(403).json({ message: 'Unauthorized role' });
    }

    // Get outlet IDs matching the filter
    const outlets = await Outlet.findAll({ where: outletFilter, attributes: ['id'] });
    const outletIds = outlets.map(o => o.id);

    // Get OutletCount entries for filtered outlets
    const outletCount = await OutletCount.findAll({
      where: { outletId: outletIds },
      include: [
        {
          model: InventoryItem,
          as: "InventoryItem",
          attributes: ["name", "purchaseUnitId", "lastPurchasePrice", "categoryId", "saleUnitId"],
          include: [
            {
              model: InventoryCatagory,
              as: "category",
              attributes: ["name"],
            },
            {
              model: Units,
              as: "saleUnit",
              attributes: ["name"],
            },
          ],
        },
        {
          model: Outlet,
          as: "Outlet",
          attributes: ["name"],
        },
      ],
    });

    const enrichedData = outletCount.map(item => {
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
        unit: item.InventoryItem?.saleUnit?.name || '',
        categoryName: item.InventoryItem?.category?.name || '',
        lastPurchasePrice: purchasePrice,
        outletId: item.outletId,
        outletName: item.Outlet?.name || '',
      };
    });

    res.status(200).json({
      success: true,
      message: "Outlet count retrieved successfully",
      data: enrichedData,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error retrieving outlet count",
      error: error.message,
    });
  }
};
 
