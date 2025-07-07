import path from 'path'
import { MenuItem, Menu, Recipe,Deal,MenuItemVariation ,DealItem} from '../models/relations.js'
import User from '../models/userModel.js'
import Role from '../models/role.js'

// import MenuItemVariation from '../models/menuItemVariation.js'
//import { Deal, MenuItem,Menu ,MenuItemVariation} from '../models/dealAssoctions.js'



// export const createMenuItem = async (req, res) => {
//   const { menuId, name, price, recipeId, variations } = req.body;
//   const adminID = req.user.id;

//   console.log('New MenuItem Request:', req.body);

//   if (!menuId || !name) {
//     return res.status(400).json({
//       success: false,
//       message: 'Menu ID and Name are required',
//     });
//   }

//   // ✅ Parse variations if it's a JSON string (for multipart/form-data)
//   let variationsData = variations;
//   if (typeof variations === 'string') {
//     try {
//       variationsData = JSON.parse(variations);
//     } catch (err) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid variations format. Must be valid JSON array.',
//       });
//     }
//   }

//   // ✅ Validation: Either a simple item or variations must be provided
//   const hasSimpleItem = recipeId && price;
//   const hasVariations =
//     variationsData && Array.isArray(variationsData) && variationsData.length > 0;

//   if (!hasSimpleItem && !hasVariations) {
//     return res.status(400).json({
//       success: false,
//       message:
//         'You must provide either a recipeId and price OR at least one variation with recipeId and price.',
//     });
//   }

//   try {
//     // ✅ Validate menuId
//     const menu = await Menu.findByPk(menuId);
//     if (!menu) {
//       return res.status(404).json({
//         success: false,
//         message: 'Invalid menuId. Menu does not exist.',
//       });
//     }

//     // ✅ Create base menu item
//     const menuItem = await MenuItem.create({
//       menuId,
//       name,
//       basePrice: hasSimpleItem ? price : null,
//       recipeId: hasSimpleItem ? recipeId : null,
//       createdBy: adminID,
//     });

//     // ✅ If image is uploaded
//     if (req.file) {
//       const imageUrl = `/uploads/${path.basename(req.file.path)}`;
//       await menuItem.update({ image: imageUrl });
//     }

//     // ✅ Handle variations
//     let createdVariations = [];

//     // 1. Handle default variation (for simple item)
//     if (hasSimpleItem) {
//       const recipe = await Recipe.findByPk(recipeId);
//       if (!recipe) {
//         return res.status(404).json({
//           success: false,
//           message: `Recipe with ID ${recipeId} does not exist.`,
//         });
//       }

//       const variation = await MenuItemVariation.create({
//         menuItemId: menuItem.id,
//         size: null, // standard or null
//         recipeId,
//         price,
//       });

//       createdVariations.push(variation);
//     }

//     // 2. Handle actual variations (if provided)
//     if (hasVariations) {
//       for (const v of variationsData) {
//         const { size, recipeId, price } = v;

//         if (!size || !recipeId || !price) {
//           return res.status(400).json({
//             success: false,
//             message:
//               'Each variation must include size, recipeId, and price.',
//           });
//         }

//         const recipe = await Recipe.findByPk(recipeId);
//         if (!recipe) {
//           return res.status(404).json({
//             success: false,
//             message: `Recipe with ID ${recipeId} does not exist.`,
//           });
//         }

//         const variation = await MenuItemVariation.create({
//           menuItemId: menuItem.id,
//           size: size.toLowerCase(),
//           recipeId,
//           price,
//         });

//         createdVariations.push(variation);
//       }
//     }

//     return res.status(201).json({
//       success: true,
//       message: 'Menu item created successfully',
//       menuItem,
//       variations: createdVariations,
//     });
//   } catch (error) {
//     console.error('Error creating menu item:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Error creating menu item',
//       error: error.message,
//     });
//   }
// };




export const createMenuItem = async (req, res) => {
  let { menuId, name, price, recipeId, variations } = req.body;
  const adminID = req.user.id;

  // Convert invalid string values to real null
  if (recipeId === 'null' || recipeId === '') recipeId = null;
  if (price === 'null' || price === '') price = null;

  if (!menuId || !name) {
    return res.status(400).json({
      success: false,
      message: 'Menu ID and Name are required',
    });
  }

  // Parse variations
  let variationsData = [];
  if (typeof variations === 'string') {
    try {
      variationsData = JSON.parse(variations);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Invalid variations format. Must be valid JSON array.',
      });
    }
  } else if (Array.isArray(variations)) {
    variationsData = variations;
  }

  try {
    // Validate menu existence
    const menu = await Menu.findByPk(menuId);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Invalid menuId. Menu does not exist.',
      });
    }

    // Create base MenuItem
    const menuItem = await MenuItem.create({
      menuId,
      name,
      basePrice: price || null,
      recipeId: recipeId || null,
      createdBy: adminID,
    });

    // Handle image upload
    if (req.file) {
      const imageUrl = `/uploads/${path.basename(req.file.path)}`;
      await menuItem.update({ image: imageUrl });
    }

    let createdVariations = [];

    // Create default variation (even with nulls)
    await MenuItemVariation.create({
      menuItemId: menuItem.id,
      size: null,
      recipeId: recipeId || null,
      price: price || null,
    });

    // Create each variation
    for (const v of variationsData) {
      let { size, recipeId: vRecipeId, price: vPrice } = v;

      // Convert variation fields
      if (vRecipeId === 'null' || vRecipeId === '') vRecipeId = null;
      if (vPrice === 'null' || vPrice === '') vPrice = null;

      const variation = await MenuItemVariation.create({
        menuItemId: menuItem.id,
        size: size?.toLowerCase() || null,
        recipeId: vRecipeId,
        price: vPrice,
      });

      createdVariations.push(variation);
    }

    return res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      menuItem,
      variations: createdVariations,
    });

  } catch (error) {
    console.error('Error creating menu item:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating menu item',
      error: error.message,
    });
  }
};







export const getMenuItemsAndDeals = async (req, res) => {
  try {
    const userID = req.user.id;

    // Get current user with role
    const user = await User.findOne({
      where: { id: userID },
      include: { model: Role, attributes: ['name'] },
    });

    if (!user || !user.role) {
      return res.status(404).json({ message: 'User or role not found' });
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
        return res.status(403).json({ message: 'Manager or admin not found' });
      }
      const adminId = manager.addedBy;
      createdByIds = [userID, user.addedBy, adminId];
    } else {
      return res.status(403).json({ message: 'Unauthorized role' });
    }

    // --- Fetch Menu Items ---
    const menuItems = await MenuItem.findAll({
      where: { createdBy: createdByIds },
      include: [
        {
          model: Menu,
          attributes: ['name'],
        },
        {
          model: MenuItemVariation,
          include: {
            model: Recipe,
            attributes: ['name'],
          },
        },
      ],
    });

    // --- Fetch Deals ---
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

    // Format deals
    // Format deals
const formattedDeals = deals.map(deal => {
  const menuMap = {};

  for (const item of deal.DealItems) {
    const menuId = item.Menu?.id;
    const menuName = item.Menu?.name;
    const size = item.MenuItemVariation?.size;

    const groupKey = `${menuId}-${size}`; // Group by menuId + size

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
    name: deal.name,
    description: deal.description,
    price: deal.price,
    quantity: deal.quantity,
    status: deal.status,
    image: deal.image,
    items: Object.values(menuMap), // result will be grouped by menuId + size
  };
});


    // --- Combined Response ---
    res.status(200).json({
      success: true,
      message: 'Menu items and deals fetched successfully',
      menuItems,
      deals: formattedDeals,
    });
  } catch (error) {
    console.error('Error fetching menu items and deals:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};



export const getMenuItemById = async (req, res) => {
  const { id } = req.params

  try {
    const menuItem = await MenuItem.findByPk(id)

    res.status(200).json({
      success: true,
      message: 'Menu item retrieved successfully',
      menuItem,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Error retrieving menu item',
      error: error.message,
    })
  }
}

export const updateMenuItem = async (req, res) => {
  const { id } = req.params
  const { menuId, recipeId, price, status, name } = req.body
  const userID = req.user.id

  try {
    const menuItem = await MenuItem.findByPk(id)
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      })
    }

    const updates = {}
    if (menuId !== undefined) updates.menuId = menuId
    if (recipeId !== undefined) updates.recipeId = recipeId
    if (price !== undefined) updates.price = price
    if (status !== undefined) updates.status = status
    if (name !== undefined) updates.name = name
    if (req.file) updates.image = `/uploads/${path.basename(req.file.path)}`

    await menuItem.update(updates)

    res.status(200).json({
      success: true,
      message: 'Menu item updated successfully',
      menuItem,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Error updating menu item',
      error: error.message,
    })
  }
}

export const deleteMenuItem = async (req, res) => {
  const { id } = req.params
  const userID = req.user.id
  const userRole = req.user.role

  try {
    const menuItem = await MenuItem.findByPk(id)
    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found',
      })
    }

    await menuItem.destroy()
    res.status(200).json({
      success: true,
      message: 'Menu item deleted successfully',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Error deleting menu item',
      error: error.message,
    })
  }
}
