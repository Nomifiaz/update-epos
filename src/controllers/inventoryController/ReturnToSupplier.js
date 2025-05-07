import {
    Outlet,
    InventoryItem,
    InventoryCatagory,
    TransferStock,
    User,
    Sections,
    returnStock,
    stockReturnToSupplier,
    Supplier,
    StockIn,
    StoreWastage,
    Units
  } from '../../models/inventeryRelations.js';
  import StoreStock from '../../models/storeStock.js';
    import { sequelize } from '../../config/db.js';
    
  
  export const ReturnTosupplier = async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { SupplierId, inventoryItemId, quantity, returnDate } = req.body;
  
      if (!SupplierId || !inventoryItemId || !quantity || !returnDate) {
        return res.status(400).json({ message: 'Missing required fields.' });
      }
  
      // Fetch current stock for the item
      const storeStock = await StoreStock.findOne({ where: { inventoryItemId }, transaction: t });
      if (!storeStock || storeStock.quantity < quantity) {
        return res.status(400).json({ message: 'Not enough stock in store  to return.' });
      }
  
      // Fetch inventory item details
      const inventoryItem = await InventoryItem.findOne({ where: { id: inventoryItemId }, transaction: t });
      if (!inventoryItem) {
        return res.status(404).json({ message: 'Inventory item not found.' });
      }
  
      const purchaseRate = parseFloat(inventoryItem.lastPurchasePrice || 0);
      const itemCode = inventoryItem.code;
      const totalReturn = parseFloat((parseFloat(quantity) * purchaseRate).toFixed(2));
  
      const createdBy = req.user?.id;
      if (!createdBy) {
        return res.status(401).json({ message: 'Unauthorized: Missing user info.' });
      }
  
      // Update StoreStock
      storeStock.quantity -= quantity;
      if (storeStock.quantity < 0) storeStock.quantity = 0;
  
      storeStock.totalPurchase = parseFloat(storeStock.totalPurchase || 0) - totalReturn;
      if (storeStock.totalPurchase < 0) storeStock.totalPurchase = 0;
  
      await storeStock.save({ transaction: t });
  
      // Create return record
      const returnRecord = await stockReturnToSupplier.create({
        SupplierId,
        returnDate,
        createdBy,
        inventoryItemId,
        quantity,
        purchaseRate,
        code: itemCode,
        totalReturn,
      }, { transaction: t });
  
      await t.commit();
  
      return res.status(201).json({
        message: 'Stock successfully returned from outlet to supplier.',
        data: returnRecord,
      });
    } catch (error) {
      await t.rollback();
      console.error('Error in returnStocks:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  // fatch all return stocks

  export const getAllStocksReturnToSupplier = async (req, res) => {
    try {
      const createdBy = req.user?.id;
  
      if (!createdBy) {
        return res.status(401).json({ message: 'Unauthorized: Missing user info.' });
      }
  
      const returnStocks = await stockReturnToSupplier.findAll({
        where: { createdBy },
        include: [
          {
            model: InventoryItem,
            as: 'inventoryItem',
            attributes: ['name'],
            include: [
              {
                model: InventoryCatagory,
                as: 'category',
                attributes: ['name'],
              },
            ],
          },
          {
            model: Supplier,
            as: 'Supplier',
            attributes: ['name'],
          },
          {
            model: User,
            as: 'createdByUser',
            attributes: ['userName'],
          },
        ],
        order: [['returnDate', 'DESC']],
      });
  
      const formattedData = returnStocks.map((stock) => ({
        user: stock.createdByUser?.userName || '',
        item: stock.inventoryItem?.name || '',
        catagory: stock.inventoryItem?.category?.name || '',
        purchaseRate: stock.purchaseRate,
        quantity: stock.quantity,
        totalReturn: stock.totalReturn,
        returnDate: stock.returnDate,
        Supplier: stock.Supplier?.name || '',
      }));
  
      return res.status(200).json({
        message: 'Return stock data fetched successfully.',
        data: formattedData,
      });
    } catch (error) {
      console.error('Error fetching return stocks:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  // store out reporsts ........
  import { Op } from 'sequelize';

export const getStoreOutReport = async (req, res) => {
  try {
    const { type, inventoryItemId, fromDate, toDate } = req.query;
    const createdBy = req.user?.id;

    if (!createdBy) {
      return res.status(401).json({ message: 'Unauthorized: Missing user info.' });
    }

    const baseFilters = { createdBy };
    if (inventoryItemId) baseFilters.inventoryItemId = inventoryItemId;
    if (fromDate && toDate) {
      baseFilters.createdAt = {
        [Op.between]: [new Date(fromDate), new Date(toDate)],
      };
    }

    const results = [];

    // 🔁 Return Stock Report
    if (!type || type === 'return') {
      const returnStocks = await stockReturnToSupplier.findAll({
        where: baseFilters,
        include: [
          {
            model: InventoryItem,
            as: 'inventoryItem',
            attributes: ['name'],
           
          },
          {
            model: User,
            as: 'createdByUser',
            attributes: ['userName'],
          },
        ],
        order: [['returnDate', 'DESC']],
      });

      returnStocks.forEach(stock => {
        results.push({
          section: stock.inventoryItem?.section?.name || '',
          user: stock.createdByUser?.userName || '',
          outlet: '', // Return stock has no outlet
          type: 'return',
          item: stock.inventoryItem?.name || '',
          date: stock.returnDate,
          quantity: stock.quantity,
          pricePerItem: stock.purchaseRate,
          total: parseFloat(stock.purchaseRate) * parseFloat(stock.quantity),
        });
      });
    }

    // 🔁 Transfer Stock Report
    if (!type || type === 'transfer') {
      const transferStocks = await TransferStock.findAll({
        where: baseFilters,
        include: [
          {
            model: InventoryItem,
            as: 'inventoryItem',
            attributes: ['name'],
           
          },

          {
            model: Sections,
            as: 'section',  
            attributes: ['name'],
          },
          {
            model: User,
            as: 'CreatedBy',
            attributes: ['userName'],
          },
          {
            model: Outlet,
            as: 'outlet',
            attributes: ['name'],
          },
        ],
        order: [['creditDate', 'DESC']],
      });

      transferStocks.forEach(stock => {
        results.push({
          section: stock.section?.name || '',
          user: stock.CreatedBy?.userName || '',
          outlet: stock.outlet?.name || '',
          type: 'transfer',
          item: stock.inventoryItem?.name || '',
          date: stock.creditDate,
          quantity: stock.quantity,
          pricePerItem: stock.purchaseRate,
          total: parseFloat(stock.purchaseRate) * parseFloat(stock.quantity),
        });
      });
    }

    return res.status(200).json({
      message: 'Store out report generated.',
      data: results,
    });
  } catch (error) {
    console.error('Error generating store out report:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// store history report ..........
export const getStoreHistoryReport = async (req, res) => {
    try {
      const { categoryId, inventoryItemId, fromDate, toDate } = req.query;
      const createdBy = req.user?.id;
  
      if (!createdBy) {
        return res.status(401).json({ message: 'Unauthorized: Missing user info.' });
      }
  
      const itemFilter = {};
      const dateRange = {};
  
      if (fromDate && toDate) {
        dateRange.createdAt = { [Op.between]: [new Date(fromDate), new Date(toDate)] };
      }
  
      // ✅ 1. Get unique inventoryItemIds from StockIn (with optional filters)
      const stockInItems = await StockIn.findAll({
        where: {
          createdBy,
          ...(inventoryItemId && { inventoryItemId }),
          ...(fromDate && toDate && { createdAt: dateRange.createdAt }),
        },
        attributes: ['inventoryItemId'],
        group: ['inventoryItemId'],
      });
  
      const itemIds = stockInItems.map((entry) => entry.inventoryItemId);
  
      if (itemIds.length === 0) {
        return res.status(200).json({ message: 'No stock-in items found.', data: [] });
      }
  
      // ✅ 2. Get full item details from InventoryItem
      const items = await InventoryItem.findAll({
        where: {
          id: itemIds,
          ...(categoryId && { categoryId }),
        },
        include: [
          {
            model: InventoryCatagory,
            as: 'category',
            attributes: ['name'],
          },
          {
            model: Units,
            as: 'purchaseUnit',
            attributes: ['name'],
          },
          {
            model: Sections,
            as: 'section',
            attributes: ['name'],
            required: false,
          },
        ],
      });
  
      const report = [];
  
      for (const item of items) {
        const itemId = item.id;
  
        // ✅ Opening Stock
        let openingStock = 0;
        if (fromDate) {
          openingStock = await StockIn.sum('quantity', {
            where: {
              inventoryItemId: itemId,
              createdBy,
              createdAt: { [Op.lt]: new Date(fromDate) },
            },
          });
        } else {
          openingStock = await StockIn.sum('quantity', {
            where: { inventoryItemId: itemId, createdBy },
          });
        }
  
        // ✅ In-period stock changes
        const stockIn = await StockIn.sum('quantity', {
          where: { inventoryItemId: itemId, createdBy, ...dateRange },
        });
  
        const storeOut = await TransferStock.sum('quantity', {
          where: { inventoryItemId: itemId, createdBy, ...dateRange },
        });
  
        const outletReturn = await returnStock.sum('quantity', {
          where: { inventoryItemId: itemId, createdBy, ...dateRange },
        });
  
        const wastage = await StoreWastage.sum('rawWastage', {
          where: { inventoryItemId: itemId, createdBy, ...dateRange },
        });
  
        const returnToSupplier = await stockReturnToSupplier.sum('quantity', {
          where: { inventoryItemId: itemId, createdBy, ...dateRange },
        });
  
        // ✅ Closing Stock = current stock from StoreStock
        const storeStock = await StoreStock.findOne({
          where: { inventoryItemId: itemId },
        });
  
        const closingStock = parseFloat(storeStock?.quantity || 0);
  
        report.push({
          category: item.category?.name || '',
          item: item.name,
          unit: item.purchaseUnit?.name || item.unit || '',
          openingStock: parseFloat(openingStock || 0),
          stockIn: parseFloat(stockIn || 0),
          storeOut: parseFloat(storeOut || 0),
          outletReturn: parseFloat(outletReturn || 0),
          wastage: parseFloat(wastage || 0),
          returnToSupplier: parseFloat(returnToSupplier || 0),
          closingStock: parseFloat(closingStock),
        });
      }
  
      return res.status(200).json({
        message: 'Store history report generated successfully.',
        data: report,
      });
    } catch (error) {
      console.error('Error generating store history report:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  
  
  