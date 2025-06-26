import { Outlet, InventoryItem, InventoryCatagory, TransferStock,User,Sections} from '../../models/inventeryRelations.js';
import StoreStock from '../../models/storeStock.js';
import outletCount from "../../models/outletCount.js"
import { Op } from 'sequelize'

import { sequelize } from "../../config/db.js"; // Make sure to import your Sequelize instance

 // Make sure this is your Sequelize instance


export const outletTransfer = async (req, res) => {
  const t = await sequelize.transaction(); // Start transaction
  try {
    const { outletId, inventoryItemId, quantity, remarks, sectionId, creditDate } = req.body;

    if (!outletId || !inventoryItemId || !quantity || !creditDate) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const parsedQuantity = parseFloat(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be a valid positive number.' });
    }

    const inventoryItem = await InventoryItem.findOne({
      where: { id: inventoryItemId },
      transaction: t
    });

    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found.' });
    }

    const purchaseRate = parseFloat(inventoryItem.lastPurchasePrice || 0);
    const itemCode = inventoryItem.code;

    if (!purchaseRate || !itemCode) {
      return res.status(400).json({ message: 'Inventory item missing purchase rate or code.' });
    }

    const totalPurchase = (parsedQuantity * purchaseRate).toFixed(2);
    const createdBy = req.user?.id;
    if (!createdBy) {
      return res.status(401).json({ message: 'Unauthorized: Missing user info.' });
    }

    const storeStock = await StoreStock.findOne({
      where: { inventoryItemId },
      transaction: t
    });

    if (!storeStock || parseFloat(storeStock.quantity) < parsedQuantity) {
      return res.status(400).json({ message: 'Not enough stock in store to transfer.' });
    }

    // Deduct from store stock
    storeStock.quantity = parseFloat(storeStock.quantity) - parsedQuantity;
    await storeStock.save({ transaction: t });

    // Create transfer record
    const transfer = await TransferStock.create({
      outletId,
      sectionId,
      creditDate,
      remarks,
      createdBy,
      inventoryItemId,
      quantity: parsedQuantity,
      purchaseRate,
      code: itemCode,
      totalPurchase,
    }, { transaction: t });

    // Update or create outlet stock
    const outletStock = await outletCount.findOne({
      where: { outletId, inventoryItemId },
      transaction: t
    });

    if (outletStock) {
      outletStock.quantity = parseFloat(outletStock.quantity || 0) + parsedQuantity;
      outletStock.purchaseRate = purchaseRate;
      outletStock.totalPurchase = parseFloat(outletStock.totalPurchase || 0) + parseFloat(totalPurchase);
      outletStock.createdBy = createdBy;
      await outletStock.save({ transaction: t });
    } else {
      await outletCount.create({
        outletId,
        inventoryItemId,
        quantity: parsedQuantity,
        purchaseRate,
        totalPurchase,
        createdBy,
      }, { transaction: t });
    }

    await t.commit(); // Commit all changes
    return res.status(201).json({
      message: 'Stock successfully transferred to outlet.',
      data: transfer,
    });

  } catch (error) {
    await t.rollback(); // Rollback all changes on error
    console.error('Error in outletTransfer:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// fatch detsils .................


export const getAllTransfers = async (req, res) => {
    try {
        const createdBy = req.user?.id;
        if (!createdBy) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const transfers = await TransferStock.findAll({
            where: { createdBy },
            include: [{
              model: InventoryItem,
                as: 'inventoryItem',
                attributes: ['name', 'lastPurchasePrice'],
            },
            {
              model: Outlet,
              as: 'outlet',
              attributes: ['name'],
            }],
            attributes: ['id', 'creditDate', 'outletId', 'quantity', 'totalPurchase'],
            order: [['creditDate', 'DESC']],
        });

        const formattedTransfers = transfers.map(t => ({
            id: t.id,
            itemName: t.inventoryItem?.name,
            creditDate: t.creditDate,
            outletName: t.outlet?.name,
            store: 'Store',
            quantity: t.quantity,
            totalPurchase: t.totalPurchase
        }));

        return res.status(200).json({message:"successfuly",formattedTransfers});
    } catch (error) {
        console.error('Error fetching transfers:', error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};
//
export const getmangerwise = async (req, res) => {
  try {
    const managerId = req.user?.id;
    if (!managerId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    console.log(managerId)

    // Step 1: Find all outlet IDs where managerId matches logged-in user
    const outlets = await Outlet.findAll({
      where: { managerId: managerId },
      attributes: ['id'],
    });

    const outletIds = outlets.map(outlet => outlet.id);

    if (outletIds.length === 0) {
      return res.status(200).json({ message: 'No assigned outlets', formattedTransfers: [] });
    }

    // Step 2: Fetch transfer records only for those outlet IDs
    const transfers = await TransferStock.findAll({
      where: {
        outletId: { [Op.in]: outletIds },
      },
      include: [
        {
          model: InventoryItem,
          as: 'inventoryItem',
          attributes: ['name', 'lastPurchasePrice'],
        },
        {
          model: Outlet,
          as: 'outlet',
          attributes: ['name'],
        },
      ],
      attributes: ['id', 'creditDate', 'outletId', 'quantity', 'totalPurchase'],
      order: [['creditDate', 'DESC']],
    });

    // Step 3: Format output
    const formattedTransfers = transfers.map(t => ({
      id: t.id,
      itemName: t.inventoryItem?.name,
      creditDate: t.creditDate,
      outletName: t.outlet?.name,
      store: 'Store',
      quantity: t.quantity,
      totalPurchase: t.totalPurchase,
    }));

    return res.status(200).json({ message: 'Successfully fetched', formattedTransfers });

  } catch (error) {
    console.error('Error fetching transfers:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// fatch details by id 
export const getTransferById = async (req, res) => {
    try {
      const { id } = req.params;
  
      const transfer = await TransferStock.findOne({
        where: { id },
        include: [
          {
            model: InventoryItem,
            as: 'inventoryItem',  // Use the correct alias
            attributes: ['name', 'lastPurchasePrice'],
          },
          {
            model: Outlet,
            as: 'outlet',  // Use the correct alias
            attributes: ['name'],
          },
        ],
      });
  
      if (!transfer) {
        return res.status(404).json({ message: 'Transfer not found.' });
      }
  
      return res.status(200).json({
        message:"successfully",
        id: transfer.id,
        creditDate: transfer.creditDate,
        outletName: transfer.outlet?.name,  // Use lowercase 'outlet'
        store: 'Store',
        itemName: transfer.inventoryItem?.name,  // Use lowercase 'inventoryItem'
        purchaseRate: transfer.purchaseRate,
        quantity: transfer.quantity,
        totalPurchase: transfer.totalPurchase,
        remarks: transfer.remarks,
      });
    } catch (error) {
      console.error('Error fetching transfer details:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

  // reports outlet in ............................
    export const getStockTransforReport = async (req, res) => {
      try {
        const {
          sectionsId,
          outletid,
          categoryId,
          itemName,
          fromDate,
          toDate
        } = req.query;
    
        const whereConditions = {
          createdBy: req.user.id
        };
    
        // Date filters
        if (fromDate && toDate) {
          whereConditions.grnDate = {
            [Op.between]: [new Date(fromDate), new Date(toDate)]
          };
        } else if (fromDate) {
          whereConditions.grnDate = { [Op.gte]: new Date(fromDate) };
        } else if (toDate) {
          whereConditions.grnDate = { [Op.lte]: new Date(toDate) };
        }
    
        if (sectionsId) {
          whereConditions.sectionId = sectionsId;
        }
    
        if (outletid) {
          whereConditions.outletId = outletid;
        }
    
        const include = [
          {
            model: Sections,
            as: 'section',
            attributes: ['id', 'name'], // Added 'id' for debugging
            required: false // Makes this a left join
          },
          {
            model: Outlet,
            as: 'outlet',
            attributes: ['name'],
            required: false
          },
          {
            model: InventoryItem,
            as: 'InventoryItem',
            attributes: ['name', 'code', 'lastPurchasePrice'],
            include: [
              {
                model: InventoryCatagory,
                as: 'category',
                attributes: ['name'],
                where: categoryId ? { id: categoryId } : undefined,
                required: false
              }
            ],
            where: itemName
              ? { name: { [Op.iLike]: `%${itemName}%` } }
              : undefined,
            required: false
          },
          {
            model: User,
            as: 'CreatedBy',
            attributes: ['userName'],
            required: false
          }
        ];
    
        const reportData = await TransferStock.findAll({
          where: whereConditions,
          include: include,
          order: [
            ['createdAt', 'DESC']
          ],
          attributes: [
            'id',
            'creditDate',
            'quantity',
            'purchaseRate',
            'totalPurchase',
            'createdAt',
            'createdBy',
            'sectionId' // Added for debugging
          ]
        });
    
        // Debug: Log the first item to see what data is being returned
        if (reportData.length > 0) {
          console.log('First item raw data:', JSON.stringify(reportData[0], null, 2));
        }
    
        const formattedData = reportData.map(item => ({
          id: item.id,
          outlet: item.outlet?.name || 'N/A',
          section: item.section?.name || 'N/A', // Added fallback
          sectionId: item.sectionId, // Added for debugging
          category: item.InventoryItem?.category?.name || 'N/A',
          item: item.InventoryItem?.name || 'N/A',
          code: item.InventoryItem?.code || 'N/A',
          quantity: item.quantity,
          currentPrice: parseFloat(item.purchaseRate).toFixed(2),
          total: parseFloat(item.totalPurchase).toFixed(2),
          createdBy: item.CreatedBy?.userName || 'System',
          createdAt: item.createdAt
        }));
    
        res.status(200).json({
          success: true,
          data: formattedData,
          totalRecords: formattedData.length,
          message: 'Stock transfer report generated successfully'
        });
    
      } catch (error) {
        console.error('Error generating stock transfer report:', error);
        res.status(500).json({
          success: false,
          message: 'Error generating report',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    };