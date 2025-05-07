import { Outlet, InventoryItem, InventoryCatagory, TransferStock,User,Sections,Units,OutletWastage} from '../../models/inventeryRelations.js';


export const addWastage = async (req, res) => {
  try {
    const { outletId, sectionId, inventoryItemId, rawWastage, remarks,createdDate } = req.body;

    // Get the createdBy user (from token, session, or other means)
    const createdBy = req.user.id; // Assuming you have the user in the request (e.g., from JWT token)

    if (!outletId || !sectionId || !inventoryItemId || !rawWastage || !createdBy) {
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

    // Create a record in the OutletWastage table
    const wastageRecord = await OutletWastage.create({
      outletId,
      sectionId,
      inventoryItemId,
      rawWastage,
      totalCostWastage,
      saleUnit,
      unitCost,
      remarks,
      createdDate,
      createdBy,  // Pass createdBy user
    });

    // Deduct the wastage quantity from the outlet's stock
    const outletStock = await OutletCount.findOne({ where: { outletId, inventoryItemId } });

    if (!outletStock || outletStock.quantity < rawWastage) {
      return res.status(400).json({ message: 'Not enough stock in outlet to record wastage.' });
    }

    // Update the outlet stock after wastage
    outletStock.quantity -= rawWastage;
    outletStock.totalPurchase -= totalCostWastage; // Assuming totalPurchase is the value of stock in the outlet
    await outletStock.save();

    return res.status(201).json({
      message: 'Wastage recorded and stock updated successfully.',
      data: wastageRecord,
    });
  } catch (error) {
    console.error('Error in adding wastage:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all wastage records

export const getAllWastageItems = async (req, res) => {
    try {
      // Get the createdBy user from the request (from the JWT token or session)
      const createdBy = req.user.id; // Assuming the user is added to the request by middleware
  
      // Fetch all wastage records created by the authenticated user
      const wastageRecords = await OutletWastage.findAll({
        where: { createdBy },
        include: [
          {
            model: Sections,
            as: 'wastageSection',
            attributes: ['name'],
          },
          {
            model: InventoryItem,
            as: 'inventoryItem',
            attributes: ['name'],
          },
          {
            model: Outlet,
            as: 'outlet',
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
        section: wastage.wastageSection?.name || '',
        item: wastage.inventoryItem?.name || '',
        saleUnit: wastage.saleUnit,
        rawWastage: wastage.rawWastage,
        totalCostWastage: wastage.totalCostWastage,
        remarks: wastage.remarks,
        createdDate: wastage.createdDate,
        outlet: wastage.outlet?.name || '',
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

  // reports wastage items
  import { Op } from 'sequelize';

export const getAllWastageItemsReports = async (req, res) => {
  try {
    const createdBy = req.user.id;

    // Get filters from query parameters
    const {
      itemId,
      categoryId,
      sectionId,
      fromDate,
      toDate,
    } = req.query;

    // Build where clause for OutletWastage
    const wastageWhere = {
      createdBy,
    };

    // Add section filter
    if (sectionId) {
      wastageWhere.sectionId = sectionId;
    }

    // Add date filter
    if (fromDate && toDate) {
      wastageWhere.createdAt = {
        [Op.between]: [new Date(fromDate), new Date(toDate)],
      };
    }

    // Build include for category filtering
    const inventoryInclude = {
      model: InventoryItem,
      as: 'inventoryItem',
      attributes: ['name'],
    };

    if (itemId) {
      inventoryInclude.where = { id: itemId };
    }

    if (categoryId) {
      inventoryInclude.include = [
        {
          model: InventoryCatagory,
          as: 'category',
          where: { id: categoryId },
          attributes: ['name'],
        },
      ];
    }

    const wastageRecords = await OutletWastage.findAll({
      where: wastageWhere,
      include: [
        {
          model: Sections,
          as: 'wastageSection',
          attributes: ['name'],
        },
        inventoryInclude,
        {
          model: Outlet,
          as: 'outlet',
          attributes: ['name'],
        },
        {
          model: User,
          as: 'createdByUser',
          attributes: ['userName'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const formattedData = wastageRecords.map((wastage) => ({
      user: wastage.createdByUser?.userName || '',
      section: wastage.wastageSection?.name || '',
      item: wastage.inventoryItem?.name || '',
      saleUnit: wastage.saleUnit,
      rawWastage: wastage.rawWastage,
      totalCostWastage: wastage.totalCostWastage,
      remarks: wastage.remarks,
      createdDate: wastage.createdAt,
      outlet: wastage.outlet?.name || '',
    }));

    return res.status(200).json({
      message: 'Filtered wastage items fetched successfully.',
      data: formattedData,
    });
  } catch (error) {
    console.error('Error fetching filtered wastage items:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
