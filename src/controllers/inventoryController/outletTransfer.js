import { Outlet, InventoryItem, InventoryCatagory, TransferStock,User,Sections} from '../../models/inventeryRelations.js';
import StoreStock from '../../models/storeStock.js';
export const outletTransfer = async (req, res) => {
  try {
    const { outletId, inventoryItemId, quantity, remarks, sectionId, creditDate } = req.body;

    if (!outletId || !inventoryItemId || !quantity || !creditDate) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Fetch item details
    const inventoryItem = await InventoryItem.findOne({ where: { id: inventoryItemId } });
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found.' });
    }

    const purchaseRate = parseFloat(inventoryItem.lastPurchasePrice);
    const itemCode = inventoryItem.code;

    if (!purchaseRate || !itemCode ) {
      return res.status(400).json({ message: 'Inventory item missing purchase rate, code or unit.' });
    }

    const totalPurchase = (parseFloat(quantity) * purchaseRate).toFixed(2);

    const createdBy = req.user?.id;
    if (!createdBy) {
      return res.status(401).json({ message: 'Unauthorized: Missing user info.' });
    }

    // ✅ Check StoreStock availability
    const storeStock = await StoreStock.findOne({ where: { inventoryItemId } });
    if (!storeStock || storeStock.quantity < quantity) {
      return res.status(400).json({ message: 'Not enough stock available in store to transfer.' });
    }

    // ✅ Deduct quantity from StoreStock
    storeStock.quantity -= quantity;
    await storeStock.save();

    // ✅ Record the transfer
    const transfer = await TransferStock.create({
      outletId,
      sectionId,
      creditDate,
      remarks,
      createdBy,
      inventoryItemId,
      quantity,
      purchaseRate,
      code: itemCode,
      totalPurchase,
    });

    // ✅ Update or insert into OutletCount
    const outletStock = await OutletCount.findOne({ where: { outletId, inventoryItemId } });
    if (outletStock) {
      outletStock.quantity += quantity;
      outletStock.purchaseRate = purchaseRate;
      outletStock.totalPurchase = parseFloat(outletStock.totalPurchase) + parseFloat(totalPurchase);
      await outletStock.save();
    } else {
      await OutletCount.create({
        outletId,
        inventoryItemId,
        quantity,
    
      });
    }

    return res.status(201).json({
      message: 'Stock successfully transferred to outlet.',
      data: transfer,
    });
  } catch (error) {
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
                model: Outlet,
                as: 'outlet',
                attributes: ['name'],
            }],
            attributes: ['id', 'creditDate', 'outletId', 'quantity', 'totalPurchase'],
            order: [['creditDate', 'DESC']],
        });

        const formattedTransfers = transfers.map(t => ({
            id: t.id,
            creditDate: t.creditDate,
            outletName: t.outlet?.name,
            store: 'Store',
            quantity: t.quantity,
            totalPurchase: t.totalPurchase
        }));

        return res.status(200).json(formattedTransfers);
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