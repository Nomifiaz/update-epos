import Order from '../../models/order.js'
import OrderItem from '../../models/oderItem.js' // Fixed typo
import MenuItem from '../../models/menuItemModel.js'
import OrderLogs from '../../models/orderLogs.js'
import { sequelize } from '../../config/db.js'
import { v4 as uuidv4 } from 'uuid' // Unique invoice generator
import UserModel from '../../models/userModel.js'
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

  const userId = req.user.id

  // Start a transaction
  const transaction = await sequelize.transaction()

  try {
    // ✅ Generate a unique invoice number (ONLY used in backend)
    const invoiceNumber = `INV-${Date.now()}-${uuidv4().slice(0, 6)}`

    // Create order in the database
    const order = await Order.create(
      {
        userId, // Picked from `req.user.id`
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
      },
      { transaction },
    )

    // Save ordered items in OrderItem table
    await Promise.all(
      items.map(async (item) => {
        await OrderItem.create(
          {
            order_id: order.id,
            menuItemId: item.itemsid,
            quantity: item.quantity,
            price: item.price,
          },
          { transaction },
        )
      }),
    )

    // Commit transaction after everything is successful
    await transaction.commit()

    // Fetch order items with menu item names
    const savedOrderItems = await OrderItem.findAll({
      where: { order_id: order.id },
      include: [
        {
          model: MenuItem,
          attributes: ['name'], // Get menu item names
        },
      ],
    })

    // Format response (🚫 Invoice number not included)
    const responseData = {
      orderId: order.id,
      newOrderType: order.newOrderType,
      subtotal: order.subtotal,
      tax: order.tax,
      discount: order.discount,
      serviceTax: order.serviceTax,
      orderNumber: order.orderNumber,
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

    // Ensure rollback is only called if the transaction was not committed
    if (transaction.finished !== 'commit') {
      await transaction.rollback()
    }

    return res.status(500).json({ message: 'Internal server error', error: error.message })
  }
}

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
    console.log('req body', req.body)
    if (!orderId || !operation || !reason || !userId || !time) {
      return res.status(400).json({ success: false, message: 'All fields are required' })
    }
    const utcTime = new Date(time).toISOString()
    const orderLog = await OrderLogs.create({
      orderId,
      operation,
      reason,
      userId,
      time:utcTime
    })
    console.log('orderLog', orderLog)
    res.status(201).json({ success: true, message: 'orderLog created', orderLog })
  } catch (err) {
    next(err)
  }
}

export const getOrderLogs = async (req, res, next) => {
  try {
    const findOrderLogs = await OrderLogs.findAll({
      include: [{ model: UserModel, attributes: ['userName'] }],
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
      include: [{ model: UserModel, attributes: ['userName'] }],
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