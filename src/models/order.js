import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./userModel.js";
import Table from "./table.js";
import Waiter from "./waiter.js";
import DeliveryBoy from "./deliveryBoy.js";
//import Item from "./itemModel.js"; // Assuming an item model exists

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  outletId:{
      type: DataTypes.INTEGER,
    allowNull: false,
  },
  
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  newOrderType: {
    type: DataTypes.ENUM("dine-in", "takeaway", "delivery"),
    allowNull: false,
  },
  tableId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Required for dine-in
  },
  waiterId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Required for dine-in
  },
  deliveryBoyId: {
    type: DataTypes.INTEGER,
    allowNull: true, // Required for delivery
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: true, // Required for delivery
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true, // Required for delivery
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true, // Required for delivery
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  serviceTax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  deliveryCharge: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  grandTotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  invoiceNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  orderNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM("pending", "completed", "cancelled"),
    defaultValue: "completed",
  },
}, { timestamps: true });

Order.belongsTo(User, { as: "Cashier", foreignKey: "userId", targetKey: "id" });
Order.belongsTo(Table, { foreignKey: "tableId", targetKey: "id" });
Order.belongsTo(Waiter, { foreignKey: "waiterId", targetKey: "id" });
Order.belongsTo(DeliveryBoy, { foreignKey: "deliveryBoyId", targetKey: "id" });

export default Order;
