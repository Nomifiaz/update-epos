import {
  Outlet,
  InventoryItem,
  InventoryCatagory,
  TransferStock,
  User,
  Sections,
  returnStock

} from '../../models/inventeryRelations.js'
import OutletCount from '../../models/outletCount.js'
import StoreStock from '../../models/storeStock.js'

export const returnStocks = async (req, res) => {
  try {
    const { outletId, inventoryItemId, quantity, remarks, sectionId, returnDate } = req.body

    if (!outletId || !inventoryItemId || !quantity || !returnDate) {
      return res.status(400).json({ message: 'Missing required fields.' })
    }

    // Fetch the outlet's current stock for this item
    const outletStock = await OutletCount.findOne({ where: { outletId, inventoryItemId } })
    if (!outletStock || outletStock.quantity < quantity) {
      return res.status(400).json({ message: 'Not enough stock in outlet to return.' })
    }

    // Fetch item info
    const inventoryItem = await InventoryItem.findOne({ where: { id: inventoryItemId } })
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found.' })
    }

    const purchaseRate = parseFloat(inventoryItem.lastPurchasePrice)
    const itemCode = inventoryItem.code
    const totalReturn = (parseFloat(quantity) * purchaseRate).toFixed(2)

    const createdBy = req.user?.id
    if (!createdBy) {
      return res.status(401).json({ message: 'Unauthorized: Missing user info.' })
    }

    // Deduct quantity from OutletCount
    outletStock.quantity -= quantity
    outletStock.totalPurchase = parseFloat(outletStock.totalPurchase || 0) - parseFloat(totalReturn)
    await outletStock.save()

    // Update or insert into StoreStock
    const storeStock = await StoreStock.findOne({ where: { inventoryItemId } })
    if (storeStock) {
      storeStock.quantity += quantity
      await storeStock.save()
    } else {
      await StoreStock.create({
        inventoryItemId,
        quantity,
      })
    }

    // Record the return in ReturnStock table
    const returnRecord = await returnStock.create({
      outletId,
      sectionId,
      returnDate,
      remarks,
      createdBy,
      inventoryItemId,
      quantity,
      purchaseRate,
      code: itemCode,
      totalReturn,
    })

    return res.status(201).json({
      message: 'Stock successfully returned from outlet to store.',
      data: returnRecord,
    })
  } catch (error) {
    console.error('Error in returnStock:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// get all return stocks
export const getAllReturnStocks = async (req, res) => {
  try {
    const returnStocks = await returnStock.findAll({
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

    // Format the output
    const formattedData = returnStocks.map(stock => ({
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

// report for return stocks
export const getAllReturnStocksReports = async (req, res) => {
  try {
    const { sectionId, inventoryItemId, categoryId, fromDate, toDate } = req.query;

    // Get user info from the request (set by the middleware)
    const createdBy = req.user.id; // Assuming the user ID is stored in `req.user.id` after JWT decoding

    // Build the "where" clause based on filters
    const whereClause = { createdBy };

    // Additional filters for section, item, and category
    if (sectionId) {
      whereClause.sectionId = sectionId;
    }

    if (inventoryItemId) {
      whereClause.inventoryItemId = inventoryItemId;
    }

    if (categoryId) {
      whereClause['$inventoryItem.categoryId$'] = categoryId;
    }

    // Date filter
    if (fromDate && toDate) {
      whereClause.returnDate = {
        [Sequelize.Op.between]: [new Date(fromDate), new Date(toDate)],
      };
    }

    // Fetch the return stocks with filters
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
    });

    // Format the output
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
