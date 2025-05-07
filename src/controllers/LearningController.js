import { sequelize } from "../config/db.js";
import Order from "../models/order.js";
import User from "../models/userModel.js";
import MenuItem from "../models/menuItemModel.js";
import OrderItem from "../models/oderItem.js";
import Menu from "../models/menuModel.js";
import { Op, fn, col } from 'sequelize'
import moment from "moment";

// Menu Wise Sales Report
export const MenuWiseSalesReport = async (req, res) => {
  const adminId = req.user.id;
  const { startDate, endDate, name, month, year, page = 1, limit = 10 } = req.query;

  try {
    // Fetch all cashiers added by this admin
    const cashiers = await User.findAll({
      where: { role: 'cashier', addedBy: adminId },
      attributes: ['id'],
    });
    const cashierIds = [...cashiers.map(c => c.id), adminId];

    // Filter orders by date range
    let orderWhere = { userId: { [Op.in]: cashierIds } };

    if (month && year) {
      const start = moment(`${year}-${month}`, 'YYYY-MM').startOf('month').toDate();
      const end = moment(`${year}-${month}`, 'YYYY-MM').endOf('month').toDate();
      orderWhere.createdAt = { [Op.between]: [start, end] };
    } else if (year) {
      const start = moment(`${year}`, 'YYYY').startOf('year').toDate();
      const end = moment(`${year}`, 'YYYY').endOf('year').toDate();
      orderWhere.createdAt = { [Op.between]: [start, end] };
    } else if (startDate && endDate) {
      const start = moment(startDate).startOf('day').toDate();
      const end = moment(endDate).endOf('day').toDate();
      orderWhere.createdAt = { [Op.between]: [start, end] };
    } else {
      // Default: today
      const start = moment().startOf('day').toDate();
      const end = moment().endOf('day').toDate();
      orderWhere.createdAt = { [Op.between]: [start, end] };
    }

    const orders = await Order.findAll({
      where: orderWhere,
      attributes: ['id'],
      raw: true,
    });

    const orderIds = orders.map(order => order.id);

    if (orderIds.length === 0) {
      return res.status(200).json({
        message: "No sales data found",
        total_order_count: 0,
        totalMenuSold: [],
        total_revenue: 0
      });
    }

    // Prepare item filter
    let itemWhereClause = { order_id: { [Op.in]: orderIds } };
    if (name) {
      itemWhereClause["$MenuItem.Menu.name$"] = name;
    }

    const totalMenuSold = await OrderItem.findAll({
      attributes: [
        [sequelize.fn("SUM", sequelize.col("quantity")), "totalQuantitySold"],
        [sequelize.fn("SUM", sequelize.col("price")), "grandTotal"],
        [sequelize.col("MenuItem.Menu.id"), "menuId"],
        [sequelize.col("MenuItem.Menu.name"), "menuName"],
      ],
      include: [
        {
          model: MenuItem,
          attributes: [],
          include: [
            {
              model: Menu,
              attributes: [],
            },
          ],
        },
      ],
      where: itemWhereClause,
      group: ["MenuItem.Menu.id"],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    // ✅ Correct revenue calculation using .get()
    const total_revenue = totalMenuSold
      .map(item => parseFloat(item.get("grandTotal") || 0))
      .reduce((a, b) => a + b, 0);

    res.status(200).json({
      message: "Menu wise sales report",
      total_order_count: orderIds.length,
      totalMenuSold,
      total_revenue: total_revenue.toFixed(2),
    });

  } catch (error) {
    console.error("Error fetching menu-wise sales report:", error);
    res.status(500).json({ message: "Error occurred", error });
  }
};


//daily wise ................................................

export const DailySalesReport = async (req, res) => {
  const adminId = req.user.id;
  const { date = moment().format("YYYY-MM-DD") } = req.query;

  try {
    // Fetch all cashiers added by the admin
    const cashiers = await User.findAll({
      where: { role: 'cashier', addedBy: adminId },
      attributes: ['id'],
    });
    const cashierIds = [...cashiers.map(c => c.id), adminId]; // Include admin's own orders

    // Calculate the start and end of the day
    const startOfDay = moment(date).startOf("day").toDate();
    const endOfDay = moment(date).endOf("day").toDate();

    // Fetch orders placed by the cashiers and admin in the given time range
    const orders = await Order.findAll({
      where: {
        userId: { [Op.in]: cashierIds },
        createdAt: { [Op.between]: [startOfDay, endOfDay] },
      },
      attributes: ['id', 'grandTotal', 'createdAt', 'paymentMethod'],
      raw: true,
    });

    // Calculate total sales, total transactions, and average order value
    const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.grandTotal || 0), 0);
    const totalTransactions = orders.length;
    const averageOrder = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // Calculate hourly sales
    const hourlySales = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour.toString().padStart(2, '0')}:00`,
      sales: 0,
    }));
    orders.forEach(order => {
      const hour = moment(order.createdAt).hour();
      hourlySales[hour].sales += parseFloat(order.grandTotal || 0);
    });

    // Payment method breakdown with default zero values
    const paymentStats = {
      cash: 0,
      easypaisa: 0,
      jazzcash: 0,
      debitcard: 0,
      other: 0,
    };

    orders.forEach(order => {
      const method = (order.paymentMethod || '').toLowerCase();

      if (paymentStats.hasOwnProperty(method)) {
        paymentStats[method] += parseFloat(order.grandTotal || 0);
      } else {
        paymentStats.other += parseFloat(order.grandTotal || 0);
      }
    });

    // Round payment stats to 2 decimal places
    Object.keys(paymentStats).forEach(key => {
      paymentStats[key] = paymentStats[key].toFixed(2);
    });

    // Fetch menu-wise sales (using orderIds)
    const orderIds = orders.map(order => order.id); // Collect order IDs

    const menuWiseSales = await OrderItem.findAll({
      attributes: [
        [sequelize.fn("SUM", sequelize.col("quantity")), "totalQuantitySold"],
        [sequelize.fn("SUM", sequelize.col("price")), "grandTotal"],
        [sequelize.col("MenuItem.Menu.id"), "menuId"],
        [sequelize.col("MenuItem.Menu.name"), "menuName"],
      ],
      include: [
        {
          model: MenuItem,
          attributes: [],
          include: [
            {
              model: Menu,
              attributes: [],
            },
          ],
        },
      ],
      where: {
        order_id: { [Op.in]: orderIds },
        createdAt: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
      group: ["MenuItem.Menu.id"],
      raw: true,
    });

    // Return the results as a response
    res.status(200).json({
      message: "Daily Sales Report",
      date,
      totalSales: totalSales.toFixed(2),
      totalTransactions,
      averageOrder: averageOrder.toFixed(2),
      hourlySales,
      paymentStats,
      menuWiseSales,
    });

  } catch (error) {
    console.error("Daily Sales Report Error:", error);
    res.status(500).json({ message: "Error fetching daily report", error });
  }
};

// weekly wise ..........
export const WeeklySalesReport = async (req, res) => {
  const adminId = req.user.id;
  const { date = moment().format("YYYY-MM-DD") } = req.query;

  try {
    const cashiers = await User.findAll({
      where: { role: 'cashier', addedBy: adminId },
      attributes: ['id'],
    });
    const cashierIds = [...cashiers.map(c => c.id), adminId];

    // Define the start and end of the week
    const startOfWeek = moment(date).startOf('week').toDate();
    const endOfWeek = moment(date).endOf('week').toDate();

    const orders = await Order.findAll({
      where: {
        userId: { [Op.in]: cashierIds },
        createdAt: { [Op.between]: [startOfWeek, endOfWeek] },
      },
      attributes: ['id', 'grandTotal', 'createdAt', 'paymentMethod'],
      raw: true,
    });

    const totalSales = orders.reduce((sum, order) => sum + parseFloat(order.grandTotal || 0), 0);
    const totalTransactions = orders.length;
    const averageOrder = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // Daily breakdown (Sunday to Saturday)
    const dailySales = Array.from({ length: 7 }, (_, i) => ({
      day: moment().day(i).format("dddd"),
      sales: 0,
    }));
    orders.forEach(order => {
      const dayIndex = moment(order.createdAt).day();
      dailySales[dayIndex].sales += parseFloat(order.grandTotal || 0);
    });

    const paymentStats = {
      cash: 0,
      easypaisa: 0,
      jazzcash: 0,
      debitcard: 0,
      other: 0,
    };

    orders.forEach(order => {
      const method = (order.paymentMethod || '').toLowerCase();
      if (paymentStats.hasOwnProperty(method)) {
        paymentStats[method] += parseFloat(order.grandTotal || 0);
      } else {
        paymentStats.other += parseFloat(order.grandTotal || 0);
      }
    });

    Object.keys(paymentStats).forEach(key => {
      paymentStats[key] = paymentStats[key].toFixed(2);
    });

    const orderIds = orders.map(order => order.id);

    const menuWiseSales = await OrderItem.findAll({
      attributes: [
        [sequelize.fn("SUM", sequelize.col("quantity")), "totalQuantitySold"],
        [sequelize.fn("SUM", sequelize.col("price")), "grandTotal"],
        [sequelize.col("MenuItem.Menu.id"), "menuId"],
        [sequelize.col("MenuItem.Menu.name"), "menuName"],
      ],
      include: [
        {
          model: MenuItem,
          attributes: [],
          include: [
            {
              model: Menu,
              attributes: [],
            },
          ],
        },
      ],
      where: {
        order_id: { [Op.in]: orderIds },
        createdAt: {
          [Op.between]: [startOfWeek, endOfWeek],
        },
      },
      group: ["MenuItem.Menu.id"],
      raw: true,
    });

    res.status(200).json({
      message: "Weekly Sales Report",
      weekStart: moment(startOfWeek).format("YYYY-MM-DD"),
      weekEnd: moment(endOfWeek).format("YYYY-MM-DD"),
      totalSales: totalSales.toFixed(2),
      totalTransactions,
      averageOrder: averageOrder.toFixed(2),
      dailySales,
      paymentStats,
      menuWiseSales,
    });

  } catch (error) {
    console.error("Weekly Sales Report Error:", error);
    res.status(500).json({ message: "Error fetching weekly report", error });
  }
};




  // export const CashierWiseReport = async (req, res) => {
  //   const { startDate, endDate, name, month, year, page = 1, limit = 10 } = req.query
  //   try {
  //     let whereClause = {}
  //     // Year Filter
  //     if (year) {
  //       const filteredFirstDate = moment(`${year}`, 'YYYY').startOf('year').format('YYYY-MM-DD HH:mm:ss');
  //       const filteredEndDate = moment(`${year}`, 'YYYY').endOf('year').format('YYYY-MM-DD HH:mm:ss');
  //       whereClause.createdAt = { [Op.between]: [filteredFirstDate, filteredEndDate] };
  //     }

  //     // Month & Year Filter
  //     if (month && year) {
  //       const filteredFirstDate = moment(`${year}-${month}`, 'YYYY-MM').startOf('month').format('YYYY-MM-DD HH:mm:ss');
  //       const filteredEndDate = moment(`${year}-${month}`, 'YYYY-MM').endOf('month').format('YYYY-MM-DD HH:mm:ss');
  //       whereClause.createdAt = { [Op.between]: [filteredFirstDate, filteredEndDate] };
  //     }

  //     // Date Range Filter
  //     if (startDate && endDate) {
  //       const filteredFirstDate = moment(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss");
  //       const filteredEndDate = moment(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss");
  //       whereClause.createdAt = { [Op.between]: [filteredFirstDate, filteredEndDate] };
  //     }

  //     if(!year && !month && !startDate && !endDate) {
  //       const filteredFirstDate = moment().startOf("day").format("YYYY-MM-DD HH:mm:ss");
  //       const filteredEndDate = moment().endOf("day").format("YYYY-MM-DD HH:mm:ss");
  //       whereClause.createdAt = { [Op.between]: [filteredFirstDate, filteredEndDate] };
  //     }

  //     if (name) {
  //       whereClause['$Cashier.userName$'] = name;
  //     }

  //     const totalOrders = await Order.findAll({
  //       attributes: [
  //         "userId",
  //         [sequelize.fn("COUNT", sequelize.col("userId")), "totalOrders"],
  //         [sequelize.fn("SUM", sequelize.col("subtotal")), "totalSubtotal"],
  //         [sequelize.fn("SUM", sequelize.col("tax")), "totalTax"],
  //         [sequelize.fn("SUM", sequelize.col("discount")), "totalDiscount"],
  //         [sequelize.fn("SUM", sequelize.col("serviceTax")), "totalServiceTax"],
  //         [
  //           sequelize.fn("SUM", sequelize.col("deliveryCharge")),
  //           "totalDeliveryCharge",
  //         ],
  //         [sequelize.fn("SUM", sequelize.col("grandTotal")), "totalGrandTotal"],
  //       ],
  //       include: [
  //         {
  //           model: User,
  //           as: "Cashier",
  //           attributes: ["userName"],
  //         },
  //       ],
  //       where: whereClause,
  //       group: ["userId", "Cashier.id"],
  //       limit: parseInt(limit),         // Added limit for pagination
  //       offset: (parseInt(page) - 1) * parseInt(limit),  // Added offset for pagination
  //       logging: console.log, // Log the SQL query for debugging
  //     })

  //     const totalPrice = totalOrders.reduce((sum, order) => {
  //       return sum + parseFloat(order.dataValues.totalGrandTotal || 0);
  //     }, 0);

  //     const totalTax = totalOrders.reduce((sum, order) => {
  //       return sum + parseFloat(order.dataValues.totalTax || 0)
  //     }, 0)

  //     const totaldiscount = totalOrders.reduce((sum, order) => {
  //       return sum + parseFloat(order.dataValues.totalDiscount || 0)
  //     }, 0)

  //     const totalservicetax = totalOrders.reduce((sum, order) => {
  //       return sum + parseFloat(order.dataValues.totalServiceTax || 0)
  //     }, 0)

  //     const totaldeliverycharges = totalOrders.reduce((sum, order) => {
  //       return sum + parseFloat(order.dataValues.totalDeliveryCharge || 0)
  //     }, 0)

  //     res.json({ message: "Report fetched successfully", totalOrders, totalPrice, totalTax, totaldiscount , totalservicetax, totaldeliverycharges })
  //   } catch (error) {
  //     console.error("Error fetching sales report:", error);
  //     res.status(500).json({ message: "Error occurred", error });
  //   }
  // }

  export const CashierWiseReport = async (req, res) => {
    const { startDate, endDate, name, month, year, page = 1, limit = 10 } = req.query;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;
  
    try {
      if (currentUserRole !== 'admin' && currentUserRole !== 'superAdmin') {
        return res.status(403).json({ message: 'Only admin or superAdmin can access reports' });
      }
  
      // Get all cashiers added by current admin
      const cashiers = await User.findAll({
        where: {
          role: 'cashier',
          addedBy: currentUserId
        }
      });
  
      const cashierIds = cashiers.map(cashier => cashier.id);
  
      // If a specific cashier is selected
      let selectedCashierIds = cashierIds;
      if (name) {
        const selectedCashier = cashiers.find(c => c.userName === name);
        if (!selectedCashier) {
          return res.status(404).json({ message: 'Cashier not found or not under your supervision' });
        }
        selectedCashierIds = [selectedCashier.id];
      }
  
      // Date filtering
      let whereClause = {
        userId: {
          [Op.in]: selectedCashierIds,
        },
      };
  
      if (year && month) {
        const from = moment(`${year}-${month}`, 'YYYY-MM').startOf('month').toDate();
        const to = moment(`${year}-${month}`, 'YYYY-MM').endOf('month').toDate();
        whereClause.createdAt = { [Op.between]: [from, to] };
      } else if (year) {
        const from = moment(`${year}`, 'YYYY').startOf('year').toDate();
        const to = moment(`${year}`, 'YYYY').endOf('year').toDate();
        whereClause.createdAt = { [Op.between]: [from, to] };
      } else if (startDate && endDate) {
        const from = moment(startDate).startOf('day').toDate();
        const to = moment(endDate).endOf('day').toDate();
        whereClause.createdAt = { [Op.between]: [from, to] };
      } else {
        // Default: today
        const from = moment().startOf('day').toDate();
        const to = moment().endOf('day').toDate();
        whereClause.createdAt = { [Op.between]: [from, to] };
      }
  
      const totalOrders = await Order.findAll({
        attributes: [
          'userId',
          [fn('COUNT', col('userId')), 'totalOrders'],
          [fn('SUM', col('subtotal')), 'totalSubtotal'],
          [fn('SUM', col('tax')), 'totalTax'],
          [fn('SUM', col('discount')), 'totalDiscount'],
          [fn('SUM', col('serviceTax')), 'totalServiceTax'],
          [fn('SUM', col('deliveryCharge')), 'totalDeliveryCharge'],
          [fn('SUM', col('grandTotal')), 'totalGrandTotal'],
        ],
        include: [
          {
            model: User,
            as: 'Cashier',
            attributes: ['userName'],
          },
        ],
        where: whereClause,
        group: ['userId', 'Cashier.id'],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
      });
  
      const totals = {
        totalPrice: 0,
        totalTax: 0,
        totalDiscount: 0,
        totalServiceTax: 0,
        totalDeliveryCharges: 0,
      };
  
      totalOrders.forEach(order => {
        totals.totalPrice += parseFloat(order.dataValues.totalGrandTotal || 0);
        totals.totalTax += parseFloat(order.dataValues.totalTax || 0);
        totals.totalDiscount += parseFloat(order.dataValues.totalDiscount || 0);
        totals.totalServiceTax += parseFloat(order.dataValues.totalServiceTax || 0);
        totals.totalDeliveryCharges += parseFloat(order.dataValues.totalDeliveryCharge || 0);
      });
  
      res.json({
        message: 'Report fetched successfully',
        totalOrders,
        ...totals,
      });
  
    } catch (error) {
      console.error('Error fetching cashier report:', error);
      res.status(500).json({ message: 'Error occurred', error });
    }
  };

export const MenuItemSalesReport = async (req, res) => {
  const { startDate, endDate, name, month, year , page=1, limit=10} = req.query
  try {
    let whereClause = {}
      // Year Filter
      if (year) {
        const filteredFirstDate = moment(`${year}`, 'YYYY').startOf('year').format('YYYY-MM-DD HH:mm:ss');
        const filteredEndDate = moment(`${year}`, 'YYYY').endOf('year').format('YYYY-MM-DD HH:mm:ss');
        whereClause.createdAt = { [Op.between]: [filteredFirstDate, filteredEndDate] };
      }

      // Month & Year Filter
      if (month && year) {
        const filteredFirstDate = moment(`${year}-${month}`, 'YYYY-MM').startOf('month').format('YYYY-MM-DD HH:mm:ss');
        const filteredEndDate = moment(`${year}-${month}`, 'YYYY-MM').endOf('month').format('YYYY-MM-DD HH:mm:ss');
        whereClause.createdAt = { [Op.between]: [filteredFirstDate, filteredEndDate] };
      }

      // Date Range Filter
      if (startDate && endDate) {
        const filteredFirstDate = moment(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss");
        const filteredEndDate = moment(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss");
        whereClause.createdAt = { [Op.between]: [filteredFirstDate, filteredEndDate] };
      }

      if(!year && !month && !startDate && !endDate) {
        const filteredFirstDate = moment().startOf("day").format("YYYY-MM-DD HH:mm:ss");
        const filteredEndDate = moment().endOf("day").format("YYYY-MM-DD HH:mm:ss");
        whereClause.createdAt = { [Op.between]: [filteredFirstDate, filteredEndDate] };
      }

      if (name) {
        whereClause['$MenuItem.name$'] = name; // Filter by Menu name
      }

      const totalMenuItems = await OrderItem.findAll({
        attributes: [
          "menuItemId",
          [sequelize.fn("SUM", sequelize.col("quantity")), "totalQauntitySold"],
          [sequelize.fn("SUM", sequelize.col("price")), "grandTotal"]
        ],
        include: [
          {
            model: MenuItem,
            attributes: ["name"],
          },
        ],
        where: whereClause,
        group: ["menuItemId"],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        logging: console.log, // Log the SQL query for debugging
      });

      const total_price = totalMenuItems.reduce((sum, item) => {
        return sum + parseFloat(item.dataValues.grandTotal || 0)
      }, 0)

      res
        .status(201)
        .json({ message: "Menu items sales report", totalMenuItems, total_price });
  } catch (error) {
      console.error("Error fetching sales report:", error);
      res.status(500).json({ message: "Error occurred", error });
  }
}

export const DailyMenuItemsSalesReport = async (req, res) => {
  try {
    let whereClause = {}
    const startDate = moment().startOf("day").format("YYYY-MM-DD HH:mm:ss")
    const endDate = moment().endOf("day").format("YYYY-MM-DD HH:mm:ss")

    whereClause = {
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    }

    const totalItemsSoldToday = await OrderItem.findAll({
      attributes: [
        [sequelize.col("MenuItem.name"), "menu_item_name"],
        [sequelize.col("MenuItem.Menu.name"), "menu_name"],

      "quantity", "price"
      ],

      include: [
        {
          model: MenuItem,
          attributes: [],
          include: {
            model: Menu,
            attributes: []
          }
        }
      ],
      where: whereClause
    })

    res.status(201).json({ message: "data is fetched", totalItemsSoldToday})
  } catch (error) {
    console.error("Error fetching sales report:", error);
    res.status(500).json({ message: "Error occurred", error });
  }
}



export const CashierWiseReport2 = async (req, res) => {
    const { startDate, endDate, name } = req.query;

    try {
        let whereClause = {};

        // Date Range Filter
        let filteredFirstDate, filteredEndDate;

        if (startDate && endDate) {
            filteredFirstDate = moment(startDate).startOf("day").format("YYYY-MM-DD HH:mm:ss");
            filteredEndDate = moment(endDate).endOf("day").format("YYYY-MM-DD HH:mm:ss");
        } else {
            filteredFirstDate = moment().startOf("week").format("YYYY-MM-DD HH:mm:ss");
            filteredEndDate = moment().endOf("week").format("YYYY-MM-DD HH:mm:ss");
        }

        whereClause.createdAt = {
            [Op.between]: [ filteredFirstDate, filteredEndDate ]
        };

        if (name) {
            whereClause['$Cashier.userName$'] = name;
        }

        const totalOrders = await Order.findAll({
            attributes: [
                "userId",
                [sequelize.fn("DATE", sequelize.col("Order.createdAt")), "salesDate"],
                [sequelize.fn("COUNT", sequelize.col("userId")), "totalOrders"],
                [sequelize.fn("SUM", sequelize.col("subtotal")), "totalSubtotal"],
                [sequelize.fn("SUM", sequelize.col("tax")), "totalTax"],
                [sequelize.fn("SUM", sequelize.col("discount")), "totalDiscount"],
                [sequelize.fn("SUM", sequelize.col("serviceTax")), "totalServiceTax"],
                [sequelize.fn("SUM", sequelize.col("deliveryCharge")), "totalDeliveryCharge"],
                [sequelize.fn("SUM", sequelize.col("grandTotal")), "totalGrandTotal"]
            ],
            include: [
                {
                    model: User,
                    as: "Cashier",
                    attributes: ["userName"],
                },
            ],
            where: whereClause,
            group: ["salesDate", "userId", "Cashier.id"],
            order: [["salesDate", "ASC"]],
        });

        // Step 1: Create a complete date range
        const allDates = [];
        let currentDate = moment(filteredFirstDate);
        while (currentDate.isBefore(moment(filteredEndDate).add(1, 'day'))) {
            allDates.push(currentDate.format("YYYY-MM-DD"));
            currentDate.add(1, 'day');
        }

        // Step 2: Format Data to Ensure All Dates Appear
        const formattedData = allDates.map(date => {
            const salesOnDate = totalOrders.filter(order =>
                order.dataValues.salesDate === date
            );

            return {
                salesDate: date,
                sales: salesOnDate.length ? salesOnDate : []  // Empty array if no sales
            };
        });

        const allWeeks = []
        let currentWeek = moment(moment().startOf('month').format('YYYY-MM-DD HH:mm:ss'))
        let endWeek = moment(moment().endOf('month').format('YYYY-MM-DD HH:mm:ss'))

        console.log("Start week")
        console.log(currentWeek.format('dddd'))
        console.log(currentWeek.date())
        console.log("End week")
        console.log(endWeek.format('dddd'))
        console.log(endWeek.date())

        let week = 1
      
        while(currentWeek.isBefore(endWeek)) {
            allWeeks.push(currentWeek.format('YYYY-MM-DD'))
            currentWeek.add(1, 'week')
            console.log(currentWeek.format('dddd'))
            console.log(currentWeek.date())
            ++week
            if(week === 5) {
                break
            }
        }

        const formattedWeeksData = await Promise.all(allWeeks.map(async (week, i) => {
          // console.log(`${i + 1} week start: `, moment(week).startOf('week').format('YYYY-MM-DD HH:mm:ss'));
          // console.log(`${i + 1} week end: `, moment(week).endOf('week').format('YYYY-MM-DD HH:mm:ss'));
      
          const weekData = await Order.findAll({
              attributes: [
                  "userId",
                  [sequelize.fn("DATE", sequelize.col("Order.createdAt")), "salesDate"],
                  [sequelize.fn("COUNT", sequelize.col("userId")), "totalOrders"],
                  [sequelize.fn("SUM", sequelize.col("subtotal")), "totalSubtotal"],
                  [sequelize.fn("SUM", sequelize.col("tax")), "totalTax"],
                  [sequelize.fn("SUM", sequelize.col("discount")), "totalDiscount"],
                  [sequelize.fn("SUM", sequelize.col("serviceTax")), "totalServiceTax"],
                  [sequelize.fn("SUM", sequelize.col("deliveryCharge")), "totalDeliveryCharge"],
                  [sequelize.fn("SUM", sequelize.col("grandTotal")), "totalGrandTotal"]
              ],
              include: [
                  {
                      model: User,
                      as: "Cashier",
                      attributes: ["userName"],
                  },
              ],
              where: {
                  createdAt: {
                      [Op.between]: [
                          moment(week).startOf('week').format('YYYY-MM-DD HH:mm:ss'),
                          moment(week).endOf('week').format('YYYY-MM-DD HH:mm:ss')
                      ]
                  }
              },
              group: ["salesDate", "userId", "Cashier.id"],
              order: [["salesDate", "ASC"]],
          });
      
          return {
              week: `Week ${i + 1}`,
              sales: weekData.length ? weekData : [] // Empty array if no sales
          };
      }));

      // console.log(formattedWeeksData)

      const allMonths = []
      let currentMonth = moment(moment().startOf('year').format('YYYY-MM-DD HH:mm:ss'))
      let endMonth = moment(moment().endOf('year').format('YYYY-MM-DD HH:mm:ss'))

      while(currentMonth.isBefore(moment(endMonth))) {
          allMonths.push(currentMonth.format('YYYY-MM-DD'))
          currentMonth.add(1, 'month')

      }

      const formattedMonthsData = await Promise.all(allMonths.map(async (month, i) => {
        console.log(`${i + 1} month start: `, moment(month).startOf('month').format('YYYY-MM-DD HH:mm:ss'));
        console.log(`${i + 1} month end: `, moment(month).endOf('month').format('YYYY-MM-DD HH:mm:ss'));

        const monthData = await Order.findAll({
          attributes: [
              "userId",
              [sequelize.fn("DATE", sequelize.col("Order.createdAt")), "salesDate"],
              [sequelize.fn("COUNT", sequelize.col("userId")), "totalOrders"],
              [sequelize.fn("SUM", sequelize.col("subtotal")), "totalSubtotal"],
              [sequelize.fn("SUM", sequelize.col("tax")), "totalTax"],
              [sequelize.fn("SUM", sequelize.col("discount")), "totalDiscount"],
              [sequelize.fn("SUM", sequelize.col("serviceTax")), "totalServiceTax"],
              [sequelize.fn("SUM", sequelize.col("deliveryCharge")), "totalDeliveryCharge"],
              [sequelize.fn("SUM", sequelize.col("grandTotal")), "totalGrandTotal"]
          ],
          include: [
              {
                  model: User,
                  as: "Cashier",
                  attributes: ["userName"],
              },
          ],
          where: {
              createdAt: {
                  [Op.between]: [
                      moment(month).startOf('month').format('YYYY-MM-DD HH:mm:ss'),
                      moment(month).endOf('month').format('YYYY-MM-DD HH:mm:ss')
                  ]
              }
          },
          group: ["salesDate", "userId", "Cashier.id"],
          order: [["salesDate", "ASC"]],
      });
  
      return {
          month: `Month ${i + 1}`,
          sales: monthData.length ? monthData : [] // Empty array if no sales
      };
        
      }))

      console.log(formattedMonthsData)

        res.json({
            message: "Report fetched successfully",
            daily: formattedData,
            weekly: formattedWeeksData,
            monthly: formattedMonthsData
        });

    } catch (error) {
        console.error("Error fetching sales report:", error);
        res.status(500).json({ message: "Error occurred", error });
    }
}

export const MenuItemWeeklyReport = async (req, res) => {
  try {
    const startDate = moment().startOf('week').format('YYYY-MM-DD HH:mm:ss')
    const endDate = moment().endOf('week').format('YYYY-MM-DD HH:mm:ss')

    let whereClause = {
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    }

    const totalMenuItems = await OrderItem.findAll({
      attributes: [
        'menuItemId',
        [sequelize.fn("DATE", sequelize.col('OrderItem.createdAt')), "salesDate"],
        [sequelize.fn("SUM", sequelize.col("quantity")), "totalQuantitySold"],
        [sequelize.fn("SUM", sequelize.col("price")), "grandTotal"],
      ],
      include: [
        {
          model: MenuItem,
          attributes: ["name"]
        }
      ],
      where: whereClause,
      group: ["menuItemId", "salesDate"],
      order: [["salesDate", "ASC"]],
      logging: console.log,
    })

    const allDates = []
    let currentDate = moment(startDate)
    while(currentDate.isBefore(moment(endDate).add(1, 'day'))) {
      allDates.push(currentDate.format('YYYY-MM-DD'))
      currentDate.add(1, 'day')
    }

    totalMenuItems.map((menuItem) => {
      console.log(menuItem.dataValues.salesDate)
    })

    console.log(allDates)

    const formattedData = allDates.map((date) => {
     // console.log(date)
      const salesOnDate = totalMenuItems.filter((menuItem) => {
       // console.log(menuItem.dataValues)
        return menuItem.dataValues.salesDate === date

      })

      // console.log(salesOnDate.length)

      return {
        salesDate: date,
        sales: salesOnDate.length ? salesOnDate : []
      }
    })

    // console.log(formattedData)

    const allWeeks = []
    let firstWeek = moment(moment().startOf('month').format('YYYY-MM-DD HH:mm:ss'))
    let endWeek = moment(moment().endOf('month').format('YYYY-MM-DD HH:mm:ss'))

    let week = 1

    while(firstWeek.isBefore(endWeek)) {
      allWeeks.push(firstWeek.format('YYYY-MM-DD'))
      firstWeek.add(1, 'week')
      ++week
      if(week === 5) {
        break
      }
    }

    const formattedWeeksData = await Promise.all(allWeeks.map(async (week, i) => {
      console.log(`${i + 1} week start: `, moment(week).startOf('week').format('YYYY-MM-DD HH:mm:ss'));
      console.log(`${i + 1} week end: `, moment(week).endOf('week').format('YYYY-MM-DD HH:mm:ss'));

      const weekData = await OrderItem.findAll({
          attributes: [
              "menuItemId",
              [sequelize.fn("DATE", sequelize.col("OrderItem.createdAt")), "salesDate"],
              [sequelize.fn("SUM", sequelize.col("quantity")), "totalQuantitySold"],
              [sequelize.fn("SUM", sequelize.col("price")), "grandTotal"],
          ],
          include: [
              {
                  model: MenuItem,
                  attributes: ["name"],
              },
          ],
          where: {
              createdAt: {
                  [Op.between]: [
                      moment(week).startOf('week').format('YYYY-MM-DD HH:mm:ss'),
                      moment(week).endOf('week').format('YYYY-MM-DD HH:mm:ss')
                  ]
              }
          },
          group: ["menuItemId", "salesDate"],
          order: [["salesDate", "ASC"]],
      });
  
      return {
          week: `Week ${i + 1}`,
          sales: weekData.length ? weekData : [] // Empty array if no sales
      };
    }))

    // console.log(formattedWeeksData)

    const allMonths = []
    let firstMonth = moment(moment().startOf('year').format('YYYY-MM-DD HH:mm:ss'))
    let endMonth = moment(moment().endOf('year').format('YYYY-MM-DD HH:mm:ss'))

    while(firstMonth.isBefore(moment(endMonth))) {
      allMonths.push(firstMonth.format('YYYY-MM-DD'))
      firstMonth.add(1, 'month')
    }

    const formattedMonthData = await Promise.all(allMonths.map(async (month, i) => {
      console.log(`${i + 1} month start: `, moment(month).startOf('month').format('YYYY-MM-DD HH:mm:ss'));
      console.log(`${i + 1} month end: `, moment(month).endOf('month').format('YYYY-MM-DD HH:mm:ss'));

      const monthData = await OrderItem.findAll({
          attributes: [
              "menuItemId",
              [sequelize.fn("DATE", sequelize.col("OrderItem.createdAt")), "salesDate"],
              [sequelize.fn("SUM", sequelize.col("quantity")), "totalQuantitySold"],
              [sequelize.fn("SUM", sequelize.col("price")), "grandTotal"],
          ],
          include: [
              {
                  model: MenuItem,
                  attributes: ["name"],
              },
          ],
          where: {
              createdAt: {
                  [Op.between]: [
                      moment(month).startOf('month').format('YYYY-MM-DD HH:mm:ss'),
                      moment(month).endOf('month').format('YYYY-MM-DD HH:mm:ss')
                  ]
              }
          },
          group: ["menuItemId", "salesDate"],
          order: [["salesDate", "ASC"]],
      });

      return {
          month: `Month ${i + 1}`,
          sales: monthData.length ? monthData : [] // Empty array if no sales
      };
    }))

    res.status(201).json({message: "Data fetched successfully", status: true, data: formattedData, weekly: formattedWeeksData, monthly: formattedMonthData})

  } catch (error) {
    res.status(500).json({message: "not fetched successfully", error})
  }
}

export const MenuWiseReport2 = async (req, res) => {
  try {
    const startDate = moment().startOf('week').format("YYYY-MM-DD HH:mm:ss")
    const endDate = moment().endOf('week').format("YYYY-MM-DD HH:mm:ss")

    let whereClause = {
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    }

    const totalMenuItems = await OrderItem.findAll({
      attributes: [
        [sequelize.fn("SUM", sequelize.col("quantity")), "totalQuantitySold"],
        [sequelize.fn("SUM", sequelize.col("price")), "grandTotal"],
        [sequelize.col("MenuItem.Menu.id"), "menuId"],
        [sequelize.col("MenuItem.Menu.name"), "menuName"],
        [sequelize.fn("DATE", sequelize.col("OrderItem.createdAt")), "salesDate"]
      ],
      include: [
        {
          model: MenuItem,
          attributes: [],
          include: [
            {
              model: Menu,
              attributes: []
            }
          ]
        }
      ],
      where: whereClause,
      group: ["MenuItem.Menu.id", "salesDate"],
      logging: console.log
    })

    const allDates = []
    let currentDate = moment(startDate)
    while(currentDate.isBefore(moment(endDate).add(1, 'day'))) {
      allDates.push(currentDate.format("YYYY-MM-DD"))
      currentDate.add(1, 'day')
    }

    totalMenuItems.map((menuItem) => {
      console.log(menuItem.dataValues)
    })

    const formattedData = allDates.map((date) => {
      const salesOnDate = totalMenuItems.filter((menuItems) => {
        return menuItems.dataValues.salesDate === date
      })

      return {
        salesDate: date,
        sale: salesOnDate.length ? salesOnDate : []
      }
    })

    const allWeeks = []
    let firstWeek = moment(moment().startOf('month').format('YYYY-MM-DD HH:mm:ss'))
    let endWeek = moment(moment().endOf('month').format('YYYY-MM-DD HH:mm:ss'))

    let week = 1
    while(firstWeek.isBefore(endWeek)) {
      allWeeks.push(firstWeek.format('YYYY-MM-DD'))
      firstWeek.add(1, 'week')
      ++week
      if(week === 5) {
        break
      }
    }

    const formattedWeeksData = await Promise.all(allWeeks.map(async (week, i) => {
      console.log(`${i + 1} week start: `, moment(week).startOf('week').format('YYYY-MM-DD HH:mm:ss'));
      console.log(`${i + 1} week end: `, moment(week).endOf('week').format('YYYY-MM-DD HH:mm:ss'));

      const weekData = await OrderItem.findAll({
          attributes: [
              [sequelize.fn("SUM", sequelize.col("quantity")), "totalQuantitySold"],
              [sequelize.fn("SUM", sequelize.col("price")), "grandTotal"],
              [sequelize.col("MenuItem.Menu.id"), "menuId"],
              [sequelize.col("MenuItem.Menu.name"), "menuName"],
              [sequelize.fn("DATE", sequelize.col("OrderItem.createdAt")), "salesDate"]
          ],
          include: [
              {
                  model: MenuItem,
                  attributes: [],
                  include: [
                    {
                      model: Menu,
                      attributes: []
                    }
                  ]
              }
          ],
          where: {
              createdAt: {
                  [Op.between]: [
                      moment(week).startOf('week').format('YYYY-MM-DD HH:mm:ss'),
                      moment(week).endOf('week').format('YYYY-MM-DD HH:mm:ss')
                  ]
              }
          },
          group: ["MenuItem.Menu.id", "salesDate"],
          logging: console.log
      });

      return {
          week: `Week ${i + 1}`,
          sales: weekData.length ? weekData : [] // Empty array if no sales
      };
    }))

    const allMonths = []
    let firstMonth = moment(moment().startOf('year').format('YYYY-MM-DD HH:mm:ss'))
    let endMonth = moment(moment().endOf('year').format('YYYY-MM-DD HH:mm:ss'))

    while(firstMonth.isBefore(moment(endMonth))) {
      allMonths.push(firstMonth.format('YYYY-MM-DD'))
      firstMonth.add(1, 'month')
    }
    
    const formattedMonthData = await Promise.all(allMonths.map(async (month, i) => {
      console.log(`${i + 1} month start: `, moment(month).startOf('month').format('YYYY-MM-DD HH:mm:ss'));
      console.log(`${i + 1} month end: `, moment(month).endOf('month').format('YYYY-MM-DD HH:mm:ss'));

      const monthData = await OrderItem.findAll({
          attributes: [
              [sequelize.fn("SUM", sequelize.col("quantity")), "totalQuantitySold"],
              [sequelize.fn("SUM", sequelize.col("price")), "grandTotal"],
              [sequelize.col("MenuItem.Menu.id"), "menuId"],
              [sequelize.col("MenuItem.Menu.name"), "menuName"],
              [sequelize.fn("DATE", sequelize.col("OrderItem.createdAt")), "salesDate"]
          ],
          include: [
              {
                  model: MenuItem,
                  attributes: [],
                  include: [
                    {
                      model: Menu,
                      attributes: []
                    }
                  ]
              }
          ],
          where: {
              createdAt: {
                  [Op.between]: [
                      moment(month).startOf('month').format('YYYY-MM-DD HH:mm:ss'),
                      moment(month).endOf('month').format('YYYY-MM-DD HH:mm:ss')
                  ]
              }
          },
          group: ["MenuItem.Menu.id", "salesDate"],
          logging: console.log
      });

      return {
          month: `Month ${i + 1}`,
          sales: monthData.length ? monthData : [] // Empty array if no sales
      };
    }
    ))

    res.status(201).json({ message: "Menu items fetched successfully", status: true, data: formattedData, weekly: formattedWeeksData, monthly: formattedMonthData })
  } catch (error) {
    res.status(500).json({ message: "Data is not fetched successfully"})
  }
}

