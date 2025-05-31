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

    // Fetch current user with role
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
      const cashiers = await User.findAll({
        where: { addedBy: userID },
        include: {
          model: Role,
          where: { name: 'cashier' },
          attributes: [],
        },
        attributes: ['id'],
      });
      const cashierIds = cashiers.map((c) => c.id);
      const adminId = user.addedBy;

      allCreatedByIds = [userID, adminId, ...cashierIds];
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

    // Fetch OutletCounts by createdBy list
    const outletCount = await OutletCount.findAll({
      where: {
        createdBy: allCreatedByIds,
      },
      include: [
        {
          model: InventoryItem,
          as: "InventoryItem",
          attributes: ["name", "purchaseUnitId", "lastPurchasePrice", "categoryId","saleUnitId"],
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
