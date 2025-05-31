import { RecipeType } from '../models/relations.js'
import Role from '../models/role.js'
import User from '../models/userModel.js'

export const createRecipeType = async (req, res) => {
  try {
    const { name, sectionId } = req.body
    const adminID = req.user.id
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name of recipe type',
      })
    }
    const recipeType = await RecipeType.findOne({ where: { name } })
    if (recipeType) {
      return res.status(409).json({ success: false, message: 'Recipe type already exists' })
    }

    const newRecipeType = await RecipeType.create({ name, sectionId, createdBy: adminID })

    res.status(201).json({
      success: true,
      message: 'RecipeType created successfully',
      recipeType: newRecipeType,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Error creating recipe type',
      error: error.message,
    })
  }
}

export const getRecipeType = async (req, res) => {
  try {
    const userID = req.user.id;

    // Get the user and their role
    const user = await User.findOne({
      where: { id: userID },
      include: {
        model: Role,
        attributes: ['name'],
      },
    });

    if (!user || !user.role) {
      return res.status(404).json({ message: 'User or role not found' });
    }

    const userRole = user.role.name;
    let allCreatedByIds = [];

    if (userRole === 'admin') {
      const managers = await User.findAll({
        where: { addedBy: userID },
        include: {
          model: Role,
          where: { name: 'manager' },
          attributes: [],
        },
        attributes: ['id'],
      });
      const managerIds = managers.map((m) => m.id);

      const cashiers = await User.findAll({
        where: { addedBy: managerIds },
        include: {
          model: Role,
          where: { name: 'cashier' },
          attributes: [],
        },
        attributes: ['id'],
      });
      const cashierIds = cashiers.map((c) => c.id);

      allCreatedByIds = [userID, ...managerIds, ...cashierIds];

    } else if (userRole === 'manager') {
      const cashierList = await User.findAll({
        where: { addedBy: userID },
        include: {
          model: Role,
          where: { name: 'cashier' },
          attributes: [],
        },
        attributes: ['id'],
      });
      const cashierIds = cashierList.map((c) => c.id);

      // Include admin who added this manager
      const adminId = user.addedBy;

      allCreatedByIds = [adminId, userID, ...cashierIds];

    } else if (userRole === 'cashier') {
      const manager = await User.findOne({
        where: { id: user.addedBy },
      });

      if (!manager) {
        return res.status(403).json({ message: 'Manager not found for this cashier' });
      }

      const adminId = manager.addedBy;

      allCreatedByIds = [userID, user.addedBy, adminId];

    } else {
      return res.status(403).json({ message: 'Unauthorized role' });
    }

    const recipeTypes = await RecipeType.findAll({
      where: { createdBy: allCreatedByIds },
    });

    res.status(200).json({
      success: true,
      message: 'Fetched recipe types successfully',
      recipeTypes,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching recipe types',
      error: error.message,
    });
  }
};

export const getRecipeTypeById = async (req, res) => {
  try {
    const { id } = req.params
    const recipeType = await RecipeType.findByPk(id)
    if (!recipeType) {
      return res.status(404).json({ success: false, message: 'RecipeType not found' })
    }
    res.status(200).json({
      success: true,
      message: 'RecipeType retrieved successfully',
      recipeType,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Error retrieving RecipeType',
      error: error.message,
    })
  }
}

export const updateRecipeType = async (req, res) => {
  try {
    const { id } = req.params
    const { name } = req.body
    const userID = req.user.id 

    if (!name || !id) {
      return res.status(400).json({
        success: false,
        message: 'Provide name and ID of RecipeType',
      })
    }

    const recipeType = await RecipeType.findByPk(id)
    if (!recipeType) {
      return res.status(404).json({ success: false, message: 'RecipeType not found' })
    }
    await recipeType.update({ name })

    res.status(200).json({
      success: true,
      message: 'RecipeType updated successfully',
      recipeType,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Error updating RecipeType',
      error: error.message,
    })
  }
}

export const deleteRecipeType = async (req, res) => {
  try {
    const { id } = req.params
    if (!id) {
      return res.status(400).json({ success: false, message: 'Provide ID of RecipeType' })
    }

    const recipeType = await RecipeType.findByPk(id)
    if (!recipeType) {
      return res.status(404).json({ success: false, message: 'RecipeType not found' })
    }

    await recipeType.destroy()

    res.status(200).json({
      success: true,
      message: 'RecipeType deleted successfully',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Error deleting RecipeType',
      error: error.message,
    })
  }
}
