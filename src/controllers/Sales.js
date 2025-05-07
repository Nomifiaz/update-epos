import Order from "../models/order.js"
import User from "../models/userModel.js"
import OrderItem from "../models/oderItem.js"
import MenuItem from "../models/menuItemModel.js";

const getOrdersWithDetails = async (req, res) => {
  try {
    const orders = await Order.findAll({
      attributes: [
        "id", "userId", "newOrderType", "tableId", "waiterId", "deliveryBoyId", 
        "customerName", "phoneNumber", "address", "subtotal", "tax", "discount", 
        "serviceTax", "deliveryCharge", "grandTotal", "paymentMethod", 
        "invoiceNumber", "status", "createdAt", "updatedAt"
      ], // Select all columns from Orders

      include: [
        {
          model: User,
          as: "Cashier", // Alias for User
          attributes: [["userName", "Cashier_Name"]], // Rename userName as Cashier_Name
        },
        {
          model: OrderItem,
          attributes: ["quantity"], // Fetch quantity from OrderItems
          include: [
            {
              model: MenuItem,
              attributes: ["name"], // Fetch name from MenuItems
            },
          ],
        },
      ],

      order: [["grandTotal", "ASC"]], // Order by Orders.grandTotal (ascending)

    });

    res.status(201).json({ status: true, message: { "Cashier wise sales report": orders }});
    return orders;
  } catch (error) {
    console.error("Error fetching orders with details:", error);
    res.status(500).json({ message: "Error fetching orders with details: ", error})
    throw error;
  }
};

export default getOrdersWithDetails;
