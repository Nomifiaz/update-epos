import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Order from "./order.js";
import MenuItem from "./menuItemModel.js";

const OrderItem = sequelize.define("OrderItem", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Order,
      key: "id",
    },
  },
  menuItemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: MenuItem,
      key: "id",
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  }
 
});

// Define associations
Order.hasMany(OrderItem, {
  foreignKey: "order_id",
  onDelete: "CASCADE",
});
OrderItem.belongsTo(Order, {
  foreignKey: "order_id",
  onDelete: "CASCADE",
});

MenuItem.hasMany(OrderItem, {
  foreignKey: "menuItemId",
  onDelete: "CASCADE",
});
OrderItem.belongsTo(MenuItem, {
  foreignKey: "menuItemId",
  onDelete: "CASCADE",
});


export default OrderItem;
