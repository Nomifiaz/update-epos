//import {MenuType} from '../models/relations.js';

import MenuType from '../models/menuTypeModel.js'
import Recipe from '../models/recipeModel.js'
import Role from '../models/role.js'

import User from '../models/userModel.js'

export const createMenuType = async (req, res) => {
  try {
    const { name } = req.body
    const adminID = req.user.id

    // Create a menu type
    const menuType = await MenuType.create({ name, createdBy: adminID })

    res.status(201).json({ message: 'Menu type created successfully', menuType })
  } catch (error) {
    res.status(500).json({ message: 'Error creating menu type', error: error.message })
  }
}

export const getMenuTypesForUser = async (req, res) => {
  try {
    const userID = req.user.id

    // Get the user and their role
    const user = await User.findOne({
      where: { id: userID },
      include: {
        model: Role,
        attributes: ['name'],
      },
    })

    if (!user || !user.role) {
      return res.status(404).json({ message: 'User or role not found' })
    }

    const userRole = user.role.name
    let allCreatedByIds = []

    if (userRole === 'admin') {
      const managers = await User.findAll({
        where: { addedBy: userID },
        include: {
          model: Role,
          where: { name: 'manager' },
          attributes: [],
        },
        attributes: ['id'],
      })
      const managerIds = managers.map((m) => m.id)

      const cashiers = await User.findAll({
        where: { addedBy: managerIds },
        include: {
          model: Role,
          where: { name: 'cashier' },
          attributes: [],
        },
        attributes: ['id'],
      })
      const cashierIds = cashiers.map((c) => c.id)

      allCreatedByIds = [userID, ...managerIds, ...cashierIds]
    } else if (userRole === 'manager') {
      const cashierList = await User.findAll({
        where: { addedBy: userID },
        include: {
          model: Role,
          where: { name: 'cashier' },
          attributes: [],
        },
        attributes: ['id'],
      })
      const cashierIds = cashierList.map((c) => c.id)

      const adminId = user.addedBy

      allCreatedByIds = [adminId, userID, ...cashierIds]
    } else if (userRole === 'cashier') {
      const manager = await User.findOne({ where: { id: user.addedBy } })

      if (!manager) {
        return res.status(403).json({ message: 'Manager not found for this cashier' })
      }

      const adminId = manager.addedBy

      allCreatedByIds = [userID, user.addedBy, adminId]
    } else {
      return res.status(403).json({ message: 'Unauthorized role' })
    }

    const menuTypes = await MenuType.findAll({
      where: { createdBy: allCreatedByIds },
    })

    res.status(200).json({
      success: true,
      message: 'Fetched menu types successfully',
      menuTypes,
    })
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching menu types',
      error: error.message,
    })
  }
}

export const getMenuTypeById = async (req, res) => {
  try {
    const { id } = req.params
    const menuType = await MenuType.findByPk(id)
    if (!menuType) {
      return res.status(404).json({ success: false, message: 'MenuType not found' })
    }
    res.status(200).json({
      success: true,
      message: 'MenuType retrieved successfully',
      menuType,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Error retrieving MenuType',
      error: error.message,
    })
  }
}

export const updateMenuType = async (req, res) => {
  try {
    const { id } = req.params
    const { name } = req.body
    const userID = req.user.id

    if (!id || !name) {
      return res.status(400).json({ success: false, message: 'Provide id and name' })
    }

    const menuType = await MenuType.findByPk(id)
    if (!menuType) {
      return res.status(404).json({ success: false, message: 'MenuType not found' })
    }

    await menuType.update({ name })

    res.status(200).json({
      success: true,
      message: 'MenuType updated successfully',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Error updating MenuType',
      error: error.message,
    })
  }
}

export const deleteMenuType = async (req, res) => {
  try {
    const { id } = req.params
    const userID = req.user.id
    console.log('Received ID:', id)

    const menuType = await MenuType.findByPk(id)
    if (!menuType) {
      return res.status(404).json({ success: false, message: 'MenuType not found' })
    }

    await menuType.destroy()

    res.status(200).json({
      success: true,
      message: 'MenuType deleted successfully',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Error deleting MenuType',
      error: error.message,
    })
  }
}
