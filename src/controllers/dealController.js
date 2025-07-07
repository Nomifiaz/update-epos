import path from 'path'
// import MenuItemVariation from "../models/menuItemVariation.js";
import { Deal, MenuItem,Menu ,MenuItemVariation} from '../models/relations.js'
import User from '../models/userModel.js'
import Role from '../models/role.js';
import DealItem from "../models/dealItems.js"
// import MenuItemVariation from "../models/menuItemVariation.js";


export const createDeal = async (req, res) => {
  const { name, description, price, quantity, status, items } = req.body;
  const adminID = req.user.id;

  if (!name || !description || !price || !items) {
    return res.status(400).json({
      success: false,
      message: "Name, description, price, and items are required",
    });
  }

  let parsedItems = [];
  if (typeof items === "string") {
    try {
      parsedItems = JSON.parse(items);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid items format. Must be valid JSON array",
      });
    }
  } else {
    parsedItems = items;
  }

  try {
    // Validate all variation IDs
    for (const group of parsedItems) {
      const { menuId, menuItems } = group;

      if (!menuId || !Array.isArray(menuItems)) {
        return res.status(400).json({
          success: false,
          message: "Each group must have a menuId and menuItems array",
        });
      }

      for (const item of menuItems) {
        if (!item.menuItemVariationId) {
          return res.status(400).json({
            success: false,
            message: "Each menu item must include menuItemVariationId",
          });
        }

        const variation = await MenuItemVariation.findByPk(item.menuItemVariationId);
        if (!variation) {
          return res.status(404).json({
            success: false,
            message: `MenuItemVariation with ID ${item.menuItemVariationId} not found`,
          });
        }
      }
    }

    // Create deal
    const imageUrl = req.file ? `/uploads/${path.basename(req.file.path)}` : null;

    const deal = await Deal.create({
      name,
      description,
      price,
      quantity: quantity || 0,
      status: status !== undefined ? status : true,
      image: imageUrl,
      createdBy: adminID,
    });

    // Add deal items
    const createdItems = [];

    for (const group of parsedItems) {
      const { menuId, menuItems } = group;

      for (const item of menuItems) {
        const dealItem = await DealItem.create({
          dealId: deal.id,
          menuId,
          menuItemVariationId: item.menuItemVariationId,
        });
        createdItems.push(dealItem);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Deal created successfully",
      deal,
      items: createdItems,
    });
  } catch (error) {
    console.error("Error creating deal:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating deal",
      error: error.message,
    });
  }
};

export const getDeals = async (req, res) => {
  try {
    const userID = req.user.id;

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
      const adminId = user.addedBy;

      const cashiers = await User.findAll({
        where: { addedBy: userID },
        include: { model: Role, where: { name: 'cashier' }, attributes: [] },
        attributes: ['id'],
      });
      const cashierIds = cashiers.map(c => c.id);

      createdByIds = [userID, adminId, ...cashierIds];

    } else if (userRole === 'cashier') {
      const manager = await User.findOne({ where: { id: user.addedBy } });

      if (!manager || !manager.addedBy) {
        return res.status(403).json({ success: false, message: 'Manager or admin not found' });
      }

      const adminId = manager.addedBy;
      createdByIds = [userID, user.addedBy, adminId];
    } else {
      return res.status(403).json({ success: false, message: 'Unauthorized role' });
    }

    const deals = await Deal.findAll({
      where: { createdBy: createdByIds },
      include: [
        {
          model: DealItem,
          include: [
            {
              model: Menu,
              attributes: ['id', 'name'],
            },
            {
              model: MenuItemVariation,
              attributes: ['id', 'size', 'price'],
              include: {
                model: MenuItem,
                attributes: ['id', 'name'],
              },
            },
          ],
        },
      ],
    });

    const formattedDeals = deals.map(deal => {
      const menuMap = {};

      for (const item of deal.DealItems) {
        const menuId = item.Menu?.id;
        const menuName = item.Menu?.name;
        const size = item.MenuItemVariation?.size;

        const groupKey = `${menuId}-${size}`; // Unique by menuId and size

        if (!menuMap[groupKey]) {
          menuMap[groupKey] = {
            menuId,
            name: menuName,
            
            menuItems: [],
          };
        }

        menuMap[groupKey].menuItems.push({
          menuItemVariationId: item.MenuItemVariation?.id,
          size: item.MenuItemVariation?.size,
          price: item.MenuItemVariation?.price,
          menuItem: {
            id: item.MenuItemVariation?.MenuItem?.id,
            name: item.MenuItemVariation?.MenuItem?.name,
          },
        });
      }

      return {
        id: deal.id,
        image: deal.image,
        name: deal.name,
        description: deal.description,
        price: deal.price,
        quantity: deal.quantity,
        status: deal.status,
        items: Object.values(menuMap),
      };
    });

    res.status(200).json({
      success: true,
      message: 'Deals fetched successfully',
      deals: formattedDeals,
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

   
    await deal.destroy();

    res.status(200).json({ success: true, message: "Deal deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error deleting deal", error: error.message });
  }
};
