import Order from '../../models/order.js'
import OrderItem from '../../models/oderItem.js'
import MenuItem from '../../models/menuItemModel.js'
import { sequelize } from '../../config/db.js'
import { v4 as uuidv4 } from 'uuid'

import Role from '../../models/role.js'
import User from '../../models/userModel.js'
import Outlet from '../../models/outlet.js'
import OutletCount from '../../models/outletCount.js'
import Recipe from '../../models/recipeModel.js'
import RecipeItem from '../../models/recipeitem.js'
import InventoryItem from '../../models/inventoryItem.js'
import Units from '../../models/units.js'
import MenuItemVariation from '../../models/menuItemVariation.js'
import OrderLogs from '../../models/orderLogs.js'

export const createOrder = async (req, res) => {
  const {
    newOrderType,
    orderNumber,
    tableId,
    waiterId,
    deliveryBoyId,
    customerName,
    phoneNumber,
    address,
    items,
    subtotal,
    tax,
    discount,
    serviceTax,
    deliveryCharge,
    grandTotal,
    paymentMethod,
  } = req.body

  console.log('new data', req.body)
  const userId = req.user.id
  const transaction = await sequelize.transaction()

  try {
    const currentUser = await User.findOne({
      where: { id: userId },
      include: [{ model: Role, attributes: ['name'] }],
    })

    if (!currentUser) return res.status(404).json({ message: 'User not found' })

    const roleName = currentUser.role.name
    let outletId = null

    if (roleName === 'manager') {
      const managerOutlet = await Outlet.findOne({ where: { managerId: currentUser.id } })
      if (!managerOutlet) return res.status(400).json({ message: 'No outlet assigned to manager' })
      outletId = managerOutlet.id
    } else if (roleName === 'cashier') {
      const manager = await User.findOne({
        where: { id: currentUser.addedBy },
        include: [{ model: Role }],
      })
      if (!manager || manager.role.name !== 'manager') {
        return res.status(400).json({ message: 'Invalid manager for cashier' })
      }
      const managerOutlet = await Outlet.findOne({ where: { managerId: manager.id } })
      if (!managerOutlet) return res.status(400).json({ message: 'No outlet assigned to manager' })
      outletId = managerOutlet.id
    } else if (roleName === 'admin' || roleName === 'superAdmin') {
      outletId = currentUser.outletId || null
    } else {
      return res.status(403).json({ message: 'Unauthorized role for creating order' })
    }

    const invoiceNumber = `INV-${Date.now()}-${uuidv4().slice(0, 6)}`

    const order = await Order.create(
      {
        userId,
        newOrderType,
        tableId,
        waiterId,
        deliveryBoyId,
        customerName,
        phoneNumber,
        address,
        subtotal,
        tax,
        discount,
        serviceTax,
        deliveryCharge,
        grandTotal,
        paymentMethod,
        invoiceNumber,
        orderNumber,
        outletId,
      },
      { transaction },
    )

    for (const item of items) {
      const variation = await MenuItemVariation.findOne({
        where: { id: item.menuItemVariationId },
      })

      const menuItemId = variation.menuItemId
      const recipeId = variation.recipeId

      await OrderItem.create(
        {
          order_id: order.id,
          menuItemId: menuItemId,
          quantity: item.quantity,
          price: item.price,
        },
        { transaction },
      )

      // ✅ Skip inventory deduction if there's no recipeId
      if (!recipeId) {
        console.log(`ℹ️ Skipping inventory deduction: No recipe for variation ID ${variation.id}`)
        continue
      }

      const recipeItems = await RecipeItem.findAll({ where: { recipeId } })

      for (const recipe of recipeItems) {
        const inventoryItem = await InventoryItem.findOne({ where: { id: recipe.inventoryItemId } })
        if (!inventoryItem)
          throw new Error(`Inventory item not found for ID: ${recipe.inventoryItemId}`)

        const [saleUnit, purchaseUnit] = await Promise.all([
          Units.findOne({ where: { id: inventoryItem.saleUnitId } }),
          Units.findOne({ where: { id: inventoryItem.purchaseUnitId } }),
        ])

        const saleUnitName = saleUnit?.name?.toLowerCase()
        const purchaseUnitName = purchaseUnit?.name?.toLowerCase()

        let totalUsedQty = recipe.quantity * item.quantity

        if (saleUnitName === 'gram' && purchaseUnitName === 'kg') {
          totalUsedQty = totalUsedQty / 1000
        } else if (saleUnitName === 'ml' && purchaseUnitName === 'liter') {
          totalUsedQty = totalUsedQty / 1000
        }

        const outletCount = await OutletCount.findOne({
          where: {
            outletId: outletId,
            inventoryItemId: recipe.inventoryItemId,
          },
        })

        if (!outletCount || outletCount.quantity < totalUsedQty) {
          throw new Error(`❌ Not enough inventory for ${inventoryItem.name}`)
        }

        await OutletCount.update(
          { quantity: outletCount.quantity - totalUsedQty },
          {
            where: {
              outletId: outletId,
              inventoryItemId: recipe.inventoryItemId,
            },
            transaction,
          },
        )
      }
    }

    await transaction.commit()

    const savedOrderItems = await OrderItem.findAll({
      where: { order_id: order.id },
      include: [{ model: MenuItem, attributes: ['name'] }],
    })

    const responseData = {
      orderId: order.id,
      outletId: order.outletId,
      orderNumber: order.orderNumber,
      newOrderType: order.newOrderType,
      subtotal: order.subtotal,
      tax: order.tax,
      discount: order.discount,
      serviceTax: order.serviceTax,
      deliveryCharge: order.deliveryCharge,
      grandTotal: order.grandTotal,
      invoiceNumber: order.invoiceNumber,
      paymentMethod: order.paymentMethod,
      items: savedOrderItems.map((item) => ({
        name: item.MenuItem.name,
        price: item.price,
        quantity: item.quantity,
      })),
    }

    return res.status(201).json({
      message: 'Order placed successfully',
      order: responseData,
    })
  } catch (error) {
    console.error('Error creating order:', error)
    if (transaction.finished !== 'commit') {
      await transaction.rollback()
    }
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    })
  }
}

//.......................................................................................
export const getAllOrders = async (req, res, next) => {
  try {
    const findOrders = await Order.findAll()
    return res.status(200).json({ success: true, message: 'All Orders found', findOrders })
  } catch (err) {
    next(err)
  }
}

export const createOrderLogs = async (req, res, next) => {
  try {
    const { orderId, operation, reason, userId, time } = req.body
    if (!orderId || !operation || !reason || !userId || !time) {
      return res.status(400).json({ success: false, message: 'All fields are required' })
    }
    const utcTime = new Date(time).toISOString()
    const orderLog = await OrderLogs.create({
      orderId,
      operation,
      reason,
      userId,
      time: utcTime,
    })
    res.status(201).json({ success: true, message: 'orderLog created', orderLog })
  } catch (err) {
    next(err)
  }
}

export const getOrderLogs = async (req, res, next) => {
  try {
    const findOrderLogs = await OrderLogs.findAll({
      include: [{ model: User, attributes: ['userName'] }],
    })
    if (!findOrderLogs) {
      return res.status(404).json({ success: false, message: 'No Order logs found' })
    }
    res.status(200).json({ success: true, message: 'All Orders found', findOrderLogs })
  } catch (err) {
    next(err)
  }
}

export const getOrderLogsById = async (req, res, next) => {
  try {
    const findOrderLogs = await OrderLogs.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['userName'] }],
    })
    if (!findOrderLogs) {
      return res.status(404).json({ success: false, message: 'No Order logs found' })
    }
    res.status(200).json({ success: true, message: 'All Orders found', findOrderLogs })
  } catch (err) {
    next(err)
  }
}

export const getInvoiceHistory = async (req, res, next) => {
  try {
    const userId = req.user.id
    const findOrders = await Order.findAll({
      where: { userId },
      include: [
        {
          model: OrderItem,
          include: [{ model: MenuItem, attributes: ['name'] }],
        },
      ],
    })
    return res.status(200).json({ success: true, message: 'All Orders found', findOrders })
  } catch (err) {
    next(err)
  }
}
