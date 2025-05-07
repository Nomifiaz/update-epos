// File: controllers/stockInController.js
import { Op, fn, col } from "sequelize";


import InventoryCatagory from '../../models/inventoryCatagory.js' // Import InventoryCatagory model
import StoreStock from '../../models/storeStock.js' // Import StoreStock model
import{InventoryItem,StockIn,Supplier,User,Units} from '../../models/inventeryRelations.js';
export const createStockIn = async (req, res) => {
  try {
    const { supplierId, inventoryItemId, quantity, remarks, grnNo, grnDate } = req.body

    // Validation (basic)
    if (!supplierId || !inventoryItemId || !quantity || !grnDate) {
      return res.status(400).json({ message: 'Missing required fields.' })
    }

    // Fetch item details from InventoryItem table
    const inventoryItem = await InventoryItem.findOne({ where: { id: inventoryItemId } })
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found.' })
    }

    const purchaseRate = inventoryItem.lastPurchasePrice
    const itemCode = inventoryItem.code

    if (!purchaseRate || !itemCode) {
      return res.status(400).json({ message: 'Inventory item missing purchase rate or item code.' })
    }

    // Calculate total purchase amount
    const totalPurchase = (parseFloat(quantity) * parseFloat(purchaseRate)).toFixed(2)

    const createdBy = req.user?.id // Take createdBy from decoded token
    if (!createdBy) {
      return res.status(401).json({ message: 'Unauthorized: Missing user information.' })
    }

    // Insert into StockIn
    const stockInRecord = await StockIn.create({
      grnNo,
      supplierId,
      grnDate,
      remarks,
      createdBy,
      inventoryItemId,
      quantity,
      purchaseRate,
      itemCode,
      totalPurchase,
    })

    // Update or Insert StoreStock
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

    return res.status(201).json({
      message: 'Stock In successfully recorded.',
      data: stockInRecord,
    })
  } catch (error) {
    console.error('Error creating StockIn:', error)
    return res.status(500).json({ message: 'Server Error', error: error.message })
  }
}

//get all stcok in data............................
export const getAllStockIn = async (req, res) => {
    try {
      const stockInRecords = await StockIn.findAll({
        attributes: ['grnDate', 'grnNo'],
        include: [
          {
            model: Supplier,
            as: 'Supplier', // Make sure this matches your association alias
            attributes: ['name'],
          },
        ],
        where: {
          createdBy: req.user?.id,
        },
      });
  
      const modifiedStockInRecords = stockInRecords.map((record) => ({
        ...record.toJSON(),
        supplier: record.Supplier.name, // Changed from 'supplier' to 'Supplier'
        store: 'store',
      }));
  
      return res.status(200).json(modifiedStockInRecords);
    } catch (error) {
      console.error('Error fetching StockIn records:', error);
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  };
  // get stock in by id
  export const getStockInById = async (req, res) => {
    try {
      const { id } = req.params;
  
      const stockInRecord = await StockIn.findOne({
        where: { id },
        include: [
          {
            model: Supplier,
            as: 'Supplier',
            attributes: ['name'],
          },
          {
            model: InventoryItem,
            as: 'InventoryItem',
            attributes: ['name'],
          },
        ],
      });
  
      if (!stockInRecord) {
        return res.status(404).json({ message: 'Stock In record not found.' });
      }
  
      // Optional: Format the response
      const response = {
        ...stockInRecord.toJSON(),
        supplierName: stockInRecord.Supplier?.name,
        itemName: stockInRecord.InventoryItem?.name
      };
  
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching StockIn record:', error);
      return res.status(500).json({ message: 'Server Error', error: error.message });
    }
  };

  // stock reports .......(store in reports )........................
  export const getStockInReport = async (req, res) => {
    try {
      const {
        supplierName,
        categoryId,
        itemName,
        fromDate,
        toDate,
      } = req.query;
  
      // Base where conditions - always filter by creator
      const whereConditions = {
        createdBy: req.user.id // Only show records created by this user
      };
      
      // Date range filter
      if (fromDate && toDate) {
        whereConditions.grnDate = {
          [Op.between]: [new Date(fromDate), new Date(toDate)]
        };
      } else if (fromDate) {
        whereConditions.grnDate = {
          [Op.gte]: new Date(fromDate)
        };
      } else if (toDate) {
        whereConditions.grnDate = {
          [Op.lte]: new Date(toDate)
        };
      }
  
      // Build include conditions
      const include = [
        {
          model: Supplier,
          as: 'Supplier',
          attributes: ['name'],
          where: supplierName ? {
            name: { [Op.iLike]: `%${supplierName}%` } // Case-insensitive search
          } : {}
        },
        {
          model: InventoryItem,
          as: 'InventoryItem',
          attributes: ['name'],
          include: [{
            model: InventoryCatagory,
            as: 'category', // Must match the alias defined in the association
            attributes: ['name'],
            where: categoryId ? { id: categoryId } : {}
          }],
          where: itemName ? {
            name: { [Op.iLike]: `%${itemName}%` } // Case-insensitive search
          } : {}
        },
        {
          model: User,
          as: 'CreatedBy',
          attributes: ['userName']
          // Removed the where clause here as we're already filtering by createdBy
        }
      ];
  
      // Get the report data
      const reportData = await StockIn.findAll({
        where: whereConditions,
        include: include,
        order: [
          ['grnDate', 'DESC'], // Current/newest dates first
          ['createdAt', 'DESC']
        ],
        attributes: [
          'id',
          'grnDate',
          'grnNo',
          'quantity',
          'purchaseRate',
          'totalPurchase',
          'createdAt',
          "createdBy",
        ]
      });
  
      // Format the response
      const formattedData = reportData.map(item => ({
        id: item.id,
        date: item.grnDate,
        grnNo: item.grnNo,
        createdBy: item.CreatedBy?.userName,
        supplier: item.Supplier?.name,
        item: item.InventoryItem?.name,
        category: item.InventoryItem?.category?.name, // Updated to match the alias
        quantity: item.quantity,
        rate: parseFloat(item.purchaseRate).toFixed(2),
        total: parseFloat(item.totalPurchase).toFixed(2),
        createdAt: item.createdAt
      }));
  
      res.status(200).json({
        success: true,
        data: formattedData,
        totalRecords: formattedData.length,
        message: 'Stock-in report generated successfully'
      });
  
    } catch (error) {
      console.error('Error generating stock-in report:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating report',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
  // store in data by items ........

  
   // Make sure you import these


   export const getItemWiseStockInReport = async (req, res) => {
    try {
      const { supplierName, categoryId, itemName, fromDate, toDate } = req.query;
  
      const whereConditions = {
        createdBy: req.user.id
      };
  
      if (fromDate && toDate) {
        whereConditions.grnDate = {
          [Op.between]: [new Date(fromDate), new Date(toDate)]
        };
      } else if (fromDate) {
        whereConditions.grnDate = {
          [Op.gte]: new Date(fromDate)
        };
      } else if (toDate) {
        whereConditions.grnDate = {
          [Op.lte]: new Date(toDate)
        };
      }
  
      const include = [
        {
          model: Supplier,
          as: 'Supplier',
          attributes: ['name'],
          where: supplierName ? { name: { [Op.iLike]: `%${supplierName}%` } } : {}
        },
        {
          model: InventoryItem,
          as: 'InventoryItem',
          attributes: ['name', 'lastPurchasePrice'],
          include: [
            {
              model: InventoryCatagory,
              as: 'category',
              attributes: ['name'],
              where: categoryId ? { id: categoryId } : {}
            },
            {
              model: Units,
              as: 'purchaseUnit',
              attributes: ['name']
            }
          ],
          where: itemName ? { name: { [Op.iLike]: `%${itemName}%` } } : {}
        }
      ];
  
      // First fetch all individual stock-in records
      const individualStockIns = await StockIn.findAll({
        where: whereConditions,
        include,
        attributes: [
          'id',
          'inventoryItemId',
          'grnDate',
          'quantity',
          'totalPurchase'
        ],
        order: [['grnDate', 'ASC']]
      });
  
      // Then fetch aggregated data for the grand total - simplified query
      const aggregatedData = await StockIn.findAll({
        where: whereConditions,
        attributes: [
          [fn('SUM', col('quantity')), 'totalQuantity'],
          [fn('SUM', col('totalPurchase')), 'totalPurchase']
        ],
        raw: true
      });
  
      // Variables for calculating grand total
      const grandTotalQuantity = Number(aggregatedData[0]?.totalQuantity) || 0;
      const grandTotalPurchase = Number(aggregatedData[0]?.totalPurchase) || 0;
  
      // Format individual records
      const formattedData = individualStockIns.map(item => {
        return {
          date: item.grnDate,
          supplier: item.Supplier?.name || '',
          category: item.InventoryItem?.category?.name || '',
          item: item.InventoryItem?.name || '',
          unit: item.InventoryItem?.purchaseUnit?.name || '',
          purchaseRate: parseFloat(item.InventoryItem?.lastPurchasePrice || 0).toFixed(2),
          quantity: Number(item.quantity) || 0,
          total: Number(item.totalPurchase || 0).toFixed(2)
        };
      });
  
      // Adding the grand totals at the end of the response
      formattedData.push({
        date: '',
        supplier: 'Grand Total',
        category: '',
        item: '',
        unit: '',
        purchaseRate: '',
        quantity: grandTotalQuantity,
        total: grandTotalPurchase.toFixed(2)
      });
  
      res.status(200).json({
        success: true,
        data: formattedData,
        totalRecords: formattedData.length - 1, // Subtract 1 for the grand total row
        grandTotal: {
          quantity: grandTotalQuantity,
          amount: grandTotalPurchase.toFixed(2)
        },
        message: 'Item-wise stock-in report generated successfully'
      });
  
    } catch (error) {
      console.error('Error generating item-wise stock-in report:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating report',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
  // store hestory ..............................
  

  