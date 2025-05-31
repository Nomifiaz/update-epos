import express from 'express'
import {
  createOrder,
  getAllOrders,
  getOrderLogs,
  createOrderLogs,
  getOrderLogsById,
  getInvoiceHistory
} from '../../controllers/orderController/order.js'
import { authenticateToken } from '../../middleware/authenticate.js'

const router = express.Router()

router.post('/confirm', authenticateToken, createOrder)

router.get('/', getAllOrders)
router.route('/logs').post(createOrderLogs).get(getOrderLogs)
router.get('/logs/:id', getOrderLogsById)
router.get('/invoice-history', authenticateToken, getInvoiceHistory)
export default router
