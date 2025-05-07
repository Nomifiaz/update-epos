import Order from "../models/order.js";
import User from "../models/userModel.js";
import OrderItem from "../models/oderItem.js";
import MenuItem from "../models/menuItemModel.js";
import { Op } from "sequelize"; // Import Sequelize Operators

const getOrdersWithDetails = async (req, res) => {
  try {
    const { startDate, endDate, filterType, page, limit } = req.query;

    // Ensure valid pagination numbers
    let pageNumber = parseInt(page, 10) || 1;
    let limitNumber = parseInt(limit, 10) || 10;
    if (pageNumber < 1) pageNumber = 1;
    if (limitNumber < 1 || limitNumber > 100) limitNumber = 10;

    const offset = (pageNumber - 1) * limitNumber;

    let whereCondition = {};

    // Date filtering
    if (startDate && endDate) {
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);
      if (!isNaN(parsedStartDate) && !isNaN(parsedEndDate)) {
        whereCondition.createdAt = { [Op.between]: [parsedStartDate, parsedEndDate] };
      }
    } else if (filterType === "weekly") {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date();
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      whereCondition.createdAt = { [Op.between]: [startOfWeek, endOfWeek] };
    } else if (filterType === "monthly") {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date();
      endOfMonth.setMonth(startOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);

      whereCondition.createdAt = { [Op.between]: [startOfMonth, endOfMonth] };
    } else if (filterType === "yearly") {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      startOfYear.setHours(0, 0, 0, 0);

      const endOfYear = new Date(new Date().getFullYear(), 11, 31);
      endOfYear.setHours(23, 59, 59, 999);

      whereCondition.createdAt = { [Op.between]: [startOfYear, endOfYear] };
    }

    // Get total count for pagination
    const totalOrders = await Order.count({ where: whereCondition });

    // Fetch paginated orders
    const orders = await Order.findAll({
      attributes: [
        "id", "userId", "newOrderType", "tableId", "waiterId", "deliveryBoyId", 
        "customerName", "phoneNumber", "address", "subtotal", "tax", "discount", 
        "serviceTax", "deliveryCharge", "grandTotal", "paymentMethod", 
        "invoiceNumber", "status", "createdAt", "updatedAt"
      ], 
      where: whereCondition, 

      include: [
        {
          model: User,
          as: "Cashier", 
          attributes: [["userName", "Cashier_Name"]], 
        },
        {
          model: OrderItem,
          attributes: ["quantity"], 
          include: [
            {
              model: MenuItem,
              attributes: ["name"], 
            },
          ],
        },
      ],

      order: [["createdAt", "DESC"]], // Sort by most recent orders
      limit: limitNumber,  
      offset: offset       
    });

    res.status(200).json({ 
      status: true, 
      message: "Cashier wise sales report", 
      totalOrders,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalOrders / limitNumber),
      orders
    });

  } catch (error) {
    console.error("Error fetching orders with details:", error);
    res.status(500).json({ 
      status: false, 
      message: "Error fetching orders with details", 
      error 
    });
  }
};

export default getOrdersWithDetails;
