
import { Outlet, InventoryItem, InventoryCatagory, TransferStock,User,Sections,Units,OutletWastage,StoreWastage} from '../../models/inventeryRelations.js';
import StoreStock from '../../models/storeStock.js';
export const addStoreWastage = async (req, res) => {
    try {
      const { inventoryItemId, rawWastage, remarks, createdDate } = req.body;
  
      // Get the createdBy user (from token, session, or other means)
      const createdBy = req.user.id; // Assuming you have the user in the request (e.g., from JWT token)
  
      if ( !inventoryItemId || !rawWastage || !createdBy) {
        return res.status(400).json({ message: 'Missing required fields.' });
      }
  
      // Fetch the inventory item and its sale unit details
      const inventoryItem = await InventoryItem.findOne({
        where: { id: inventoryItemId },
        include: [
          {
            model: Units,
            as: 'saleUnit',
            attributes: ['name'], // Include the name of the sale unit
          }
        ]
      });
  
      if (!inventoryItem) {
        return res.status(404).json({ message: 'Inventory item not found.' });
      }
  
      const saleUnit = inventoryItem.saleUnit?.name; // Fetch the sale unit name
      const unitCost = inventoryItem.lastPurchasePrice; // Assuming lastPurchasePrice is the unit cost
  
      // Calculate the total cost of wastage
      const totalCostWastage = parseFloat(rawWastage) * parseFloat(unitCost);
  
      // Create a record in the StoreWastage table
      const wastageRecord = await StoreWastage.create({
        inventoryItemId,
        rawWastage,
        totalCostWastage,
        saleUnit,
        unitCost,
        remarks,
        createdDate,
        createdBy,  // Pass createdBy user
      });
  
    
      // Deduct the wastage from the store's stock
      const storeStock = await StoreStock.findOne({ where: { inventoryItemId } });  // Check store stock

      if (!storeStock || storeStock.quantity < rawWastage) {
        return res.status(400).json({ message: 'Not enough stock in store to record wastage.' });
      }
  
      // Update the store stock after wastage
      storeStock.quantity -= rawWastage;
      storeStock.totalPurchase -= totalCostWastage;  // Assuming totalPurchase is also tracked in store stock
      await storeStock.save();
  
      return res.status(201).json({
        message: 'Wastage recorded and stock updated successfully.',
        data: wastageRecord,
      });
    } catch (error) {
      console.error('Error in adding wastage:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// get all wastage store  items..................
export const getAllWastageStore = async (req, res) => {
    try {
      // Get the createdBy user from the request (from the JWT token or session)
      const createdBy = req.user.id; // Assuming the user is added to the request by middleware
  
      // Fetch all wastage records created by the authenticated user
      const wastageRecords = await StoreWastage.findAll({
        where: { createdBy },
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
        order: [['createdAt', 'DESC']], // Order by creation date
      });
  
      // Format the output
      const formattedData = wastageRecords.map((wastage) => ({
        user: wastage.createdByUser?.userName || '',
        item: wastage.inventoryItem?.name || '',
        saleUnit: wastage.saleUnit,
        rawWastage: wastage.rawWastage,
        totalCostWastage: wastage.totalCostWastage,
        remarks: wastage.remarks,
        createdDate: wastage.createdDate,
    
      }));
  
      return res.status(200).json({
        message: 'Wastage items created by the user fetched successfully.',
        data: formattedData,
      });
    } catch (error) {
      console.error('Error fetching wastage items:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  export const getStoreWastageReport = async (req, res) => {
    try {
      const createdBy = req.user.id;
      const { categoryId, inventoryItemId, fromDate, toDate } = req.query;
  
      // Initialize where clause with createdBy filter
      const whereClause = {
        createdBy,
      };
  
      // Filter by date range if provided
      if (fromDate && toDate) {
        whereClause.createdDate = {
          [Op.between]: [new Date(fromDate), new Date(toDate)],
        };
      }
  
      // Filter by category if provided
      if (categoryId) {
        whereClause['$inventoryItem.categoryId$'] = categoryId;
      }
  
      // Filter by inventoryItem if provided
      if (inventoryItemId) {
        whereClause.inventoryItemId = inventoryItemId;
      }
  
      // Build include with necessary relations
      const includeClause = [
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
          model: User,
          as: 'createdByUser',
          attributes: ['userName'],
        },
      ];
  
      // Fetch wastage records from StoreWastage with the constructed filters
      const wastageRecords = await StoreWastage.findAll({
        where: whereClause,
        include: includeClause,
        order: [['createdAt', 'DESC']], // Order by created date in descending order
      });
  
      // Format the data for response
      const formattedData = wastageRecords.map((wastage) => ({
        user: wastage.createdByUser?.userName || '',
        item: wastage.inventoryItem?.name || '',
        category: wastage.inventoryItem?.category?.name || '',
        saleUnit: wastage.saleUnit,
        rawWastage: wastage.rawWastage,
        totalCostWastage: wastage.totalCostWastage,
        remarks: wastage.remarks,
        createdDate: wastage.createdDate,
      }));
  
      // Return the generated report
      return res.status(200).json({
        message: 'Wastage report generated successfully.',
        data: formattedData,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  