import path from 'path'
import { Menu, MenuType } from '../models/relations.js'
import User from '../models/userModel.js'
import Role from '../models/role.js'

export const createMenu = async (req, res) => {
  try {
    const { name, description, menuTypeId, status } = req.body
    const adminID = req.user.id

    if (!name || !description || !menuTypeId) {
      return res.status(400).json({ success: false, message: 'All fields are required' })
    }
    const menuType = await MenuType.findByPk(menuTypeId)
    if (!menuType) {
      return res.status(404).json({
        success: false,
        message: 'Invalid menuTypeId. MenuType does not exist.',
      })
    }
    const newMenu = await Menu.create({
      name,
      description,
      menuTypeId,
      status,
      createdBy: adminID,
    })
    if (newMenu && req.file) {
      const imageUrl = `/uploads/${path.basename(req.file.path)}`
      await newMenu.update({ image: imageUrl })
    }
    res.status(201).json({
      success: true,
      message: 'Menu created successfully',
      menu: newMenu,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Error creating menu',
      error: error.message,
    })
  }
}

export const getMenu = async (req, res) => {
  try {
    const userID = req.user.id

    // Get user and role info
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

    const menu = await Menu.findAll({
      where: { createdBy: allCreatedByIds },
    })

    res.status(200).json({
      success: true,
      message: 'Fetched menu successfully',
      menu,
    })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu', error: error.message })
  }
}

export const getMenuById = async (req, res) => {
  try {
    const { id } = req.params
    const menu = await Menu.findByPk(id)
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' })
    }
    res.status(200).json({ success: true, message: 'Menu retrieved successfully', menu })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Error retrieving menu',
      error: error.message,
    })
  }
}

export const updateMenu = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, menuTypeId, status } = req.body
    const userID = req.user.id // Logged-in user ID

    const menu = await Menu.findByPk(id)
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' })
    }

    if (menuTypeId) {
      const menuType = await MenuType.findByPk(menuTypeId)
      if (!menuType) {
        return res.status(404).json({
          success: false,
          message: 'Invalid menuTypeId. MenuType does not exist.',
        })
      }
    }

    const updates = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    if (menuTypeId !== undefined) updates.menuTypeId = menuTypeId
    if (status !== undefined) updates.status = status
    if (req.file) updates.image = `/uploads/${path.basename(req.file.path)}`

    await menu.update(updates)

    res.status(200).json({
      success: true,
      message: 'Menu updated successfully',
      menu,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Error updating menu',
      error: error.message,
    })
  }
}

export const deleteMenu = async (req, res) => {
  try {
    const { id } = req.params
    const menu = await Menu.findByPk(id)
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Menu not found' })
    }
    await menu.destroy()
    res.status(200).json({ success: true, message: 'Menu deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: 'Error deleting menu',
      error: error.message,
    })
  }
}
