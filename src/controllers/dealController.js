import path from 'path'
import { Deal, MenuItem } from '../models/relations.js'
import User from '../models/userModel.js'
import Role from '../models/role.js';

export const createDeal = async (req, res) => {
  const { name, description, price, quantity, status, menuId } = req.body;
  const adminID = req.user.id;

  if (!name || !description || !price || !menuId) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    // Generate image URL if a file is uploaded
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null
    //  convert integer arry

    
    // Create deal first
    const deal = await Deal.create({
      name,
      description,
      price,
      image: imageUrl,
      quantity: quantity || 0,
      status: status !== undefined ? status : true,
      menuId: Array.isArray(menuId) ? menuId : [menuId],
      createdBy: adminID  // Ensure it's an array
    });

    res.status(201).json({
      success: true,
      message: "Deal created successfully",
      deal,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error creating deal",
      error: error.message,
    });
  }
};

export const getDeals = async (req, res) => {
  try {
    const userID = req.user.id;

    // Get the full user record with role
    const user = await User.findOne({
      where: { id: userID },
      include: { model: Role, attributes: ['name'] },
    });

    if (!user || !user.role) {
      return res.status(404).json({ success: false, message: 'User or role not found' });
    }

    const userRole = user.role.name;
    let createdByIds = [];

    if (userRole === 'admin' || userRole === 'superAdmin') {
      // Admin/SuperAdmin gets deals by themselves, their managers and cashiers
      const managers = await User.findAll({
        where: { addedBy: userID },
        include: { model: Role, where: { name: 'manager' }, attributes: [] },
        attributes: ['id'],
      });
      const managerIds = managers.map(m => m.id);

      const cashiers = await User.findAll({
        where: { addedBy: managerIds },
        include: { model: Role, where: { name: 'cashier' }, attributes: [] },
        attributes: ['id'],
      });
      const cashierIds = cashiers.map(c => c.id);

      createdByIds = [userID, ...managerIds, ...cashierIds];

    } else if (userRole === 'manager') {
      // Manager gets deals by themselves, their admin, and their cashiers
      const adminId = user.addedBy;

      const cashiers = await User.findAll({
        where: { addedBy: userID },
        include: { model: Role, where: { name: 'cashier' }, attributes: [] },
        attributes: ['id'],
      });
      const cashierIds = cashiers.map(c => c.id);

      createdByIds = [userID, adminId, ...cashierIds];

    } else if (userRole === 'cashier') {
      // Cashier gets deals by themselves, their manager, and their admin
      const manager = await User.findOne({ where: { id: user.addedBy } });

      if (!manager || !manager.addedBy) {
        return res.status(403).json({ success: false, message: 'Manager or admin not found' });
      }

      const adminId = manager.addedBy;

      createdByIds = [userID, user.addedBy, adminId];
    } else {
      return res.status(403).json({ success: false, message: 'Unauthorized role' });
    }

    // Fetch deals with included menu item names
    const deals = await Deal.findAll({
      where: { createdBy: createdByIds },
      include: [{
        model: MenuItem,
        attributes: ['name'],
        through: { attributes: [] },
      }],
    });

    res.status(200).json({
      success: true,
      message: 'Deals fetched successfully',
      deals,
    });

  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching deals',
      error: error.message,
    });
  }
};

//............................................
export const getDealById = async (req, res) => {
  const { id } = req.params
  try {
    const deal = await Deal.findByPk(id, {
      include: [{
        model: MenuItem,
        attributes: ['name'],
        through: { attributes: [] }
      }]
    })

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Deal retrieved successfully',
      deal
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Error retrieving deal',
      error: error.message,
    })
  }
}

// update deal

export const updateDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, quantity, status, menuId } = req.body;
    const userID = req.user.id; // Logged-in user ID

    console.log(`Received request to update deal. Deal ID: ${id}, User ID: ${userID}`);

    const deal = await Deal.findByPk(id);

    if (!deal) {
      console.log(`Deal with ID ${id} not found.`);
      return res.status(404).json({ success: false, message: "Deal not found" });
    }

    // Check if the logged-in user is the creator of the deal
    if (Number(deal.createdBy) !== Number(userID)) {
      return res.status(403).json({ success: false, message: "Unauthorized to update this Deal" });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : deal.image;

    await deal.update({
      name: name?.trim() || deal.name,
      description: description?.trim() || deal.description,
      price: price !== undefined ? price : deal.price,
      quantity: quantity !== undefined ? quantity : deal.quantity, // Ensures 0 is accepted
      status: status !== undefined ? status : deal.status,
      menuId: menuId !== undefined ? menuId : deal.menuId,
      image: imageUrl,
    });

    res.status(200).json({ success: true, message: "Deal updated successfully", deal });
  } catch (error) {
    console.error(`Error updating deal for ID ${req.params.id}:`, error);
    res.status(500).json({ success: false, message: "Error updating deal", error: error.message });
  }
};

// Delete Deal (Only creator can delete)
export const deleteDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const userID = req.user.id; // Logged-in user ID

    const deal = await Deal.findByPk(id);
    if (!deal) {
      return res.status(404).json({ success: false, message: "Deal not found" });
    }

    // Check if the logged-in user is the creator of the deal
    if (deal.createdBy !== userID) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this Deal" });
    }

    await deal.setMenuItems([]);
    await deal.destroy();

    res.status(200).json({ success: true, message: "Deal deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error deleting deal", error: error.message });
  }
};
