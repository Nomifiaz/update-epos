import {
  Outlet,
  InventoryItem,
  InventoryCatagory,
  TransferStock,
  User,
  Sections,
  returnStock,
} from '../../models/inventeryRelations.js'
import OutletCount from '../../models/outletCount.js'
import StoreStock from '../../models/storeStock.js'

export const returnStocks = async (req, res) => {
  try {
    const {
      outletId,
      inventoryItemId,
      quantity,
      remarks,
      sectionId,
      returnDate,
    } = req.body;

    if (!outletId || !inventoryItemId || !quantity || !returnDate) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const parsedQuantity = parseFloat(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number.' });
    }

    const outletStock = await OutletCount.findOne({
      where: { outletId, inventoryItemId },
    });

    if (!outletStock || parseFloat(outletStock.quantity) < parsedQuantity) {
      return res
        .status(400)
        .json({ message: 'Not enough stock in outlet to return.' });
    }

    const inventoryItem = await InventoryItem.findOne({
      where: { id: inventoryItemId },
    });

    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found.' });
    }

    const purchaseRate = parseFloat(inventoryItem.lastPurchasePrice || 0);
    const itemCode = inventoryItem.code;
    const totalReturn = (parsedQuantity * purchaseRate).toFixed(2);

    const createdBy = req.user?.id;
    if (!createdBy) {
      return res
        .status(401)
        .json({ message: 'Unauthorized: Missing user info.' });
    }

    // Update outlet stock
    outletStock.quantity = parseFloat(outletStock.quantity || 0) - parsedQuantity;
    outletStock.totalPurchase =
      parseFloat(outletStock.totalPurchase || 0) - parseFloat(totalReturn);
    await outletStock.save();

    // Update or create store stock
    const storeStock = await StoreStock.findOne({
      where: { inventoryItemId },
    });

    if (storeStock) {
      storeStock.quantity =
        parseFloat(storeStock.quantity || 0) + parsedQuantity;
      await storeStock.save();
    } else {
      await StoreStock.create({
        inventoryItemId,
        quantity: parsedQuantity,
      });
    }

    // Create return record
    const returnRecord = await returnStock.create({
      outletId,
      sectionId,
      returnDate,
      remarks,
      createdBy,
      inventoryItemId,
      quantity: parsedQuantity,
      purchaseRate,
      code: itemCode,
      totalReturn,
    });

    return res.status(201).json({
      message: 'Stock successfully returned from outlet to store.',
      data: returnRecord,
    });
  } catch (error) {
    console.error('Error in returnStock:', error);
    return res
      .status(500)
      .json({ message: 'Server error', error: error.message });
  }
};


export const getAllReturnStocks = async (req, res) => {
  try {
    const userId = req.user.id

    const returnStocks = await returnStock.findAll({
      where: { createdBy: userId },
      include: [
        {
          model: Outlet,
          as: 'outlet',
          attributes: ['name'],
        },
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
          as: 'createdByUser',
          attributes: ['userName'],
        },
      ],
      order: [['returnDate', 'DESC']],
    })

    const formattedData = returnStocks.map((stock) => ({
      user: stock.createdByUser?.userName || '',
      section: stock.section?.name || '',
      item: stock.inventoryItem?.name || '',
      purchaseRate: stock.purchaseRate,
      quantity: stock.quantity,
      totalReturn: stock.totalReturn,
      returnDate: stock.returnDate,
      remarks: stock.remarks,
      outlet: stock.outlet?.name || '',
    }))

    return res.status(200).json({
      message: 'Return stock data fetched successfully.',
      data: formattedData,
    })
  } catch (error) {
    console.error('Error fetching return stocks:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

export const getAllReturnStocksReports = async (req, res) => {
  try {
    const { sectionId, inventoryItemId, categoryId, fromDate, toDate } = req.query
    const createdBy = req.user.id

    const whereClause = { createdBy }

    if (sectionId) {
      whereClause.sectionId = sectionId
    }

    if (inventoryItemId) {
      whereClause.inventoryItemId = inventoryItemId
    }

    if (categoryId) {
      whereClause['$inventoryItem.categoryId$'] = categoryId
    }

    if (fromDate && toDate) {
      whereClause.returnDate = {
        [Sequelize.Op.between]: [new Date(fromDate), new Date(toDate)],
      }
    }

    const returnStocks = await returnStock.findAll({
      where: whereClause,
      include: [
        {
          model: Outlet,
          as: 'outlet',
          attributes: ['name'],
        },
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
          model: Sections,
          as: 'section',
          attributes: ['name'],
        },
        {
          model: User,
          as: 'createdByUser',
          attributes: ['userName'],
        },
      ],
      order: [['returnDate', 'DESC']],
    })

    const formattedData = returnStocks.map((stock) => ({
      user: stock.createdByUser?.userName || '',
      section: stock.section?.name || '',
      item: stock.inventoryItem?.name || '',
      category: stock.inventoryItem?.category?.name || '',
      purchaseRate: stock.purchaseRate,
      quantity: stock.quantity,
      totalReturn: stock.totalReturn,
      returnDate: stock.returnDate,
      remarks: stock.remarks,
      outlet: stock.outlet?.name || '',
    }))

    return res.status(200).json({
      message: 'Return stock data fetched successfully.',
      data: formattedData,
    })
  } catch (error) {
    console.error('Error fetching return stocks:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}
