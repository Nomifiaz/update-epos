import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import InventoryItem from "./inventoryItem.js";
import InventoryCatagory from "./inventoryCatagory.js";

const StoreStock = sequelize.define("StoreStock", {
  inventoryItemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0, // Default stock is zero initially
  },
        createdBy: {
    type: DataTypes.INTEGER, // Admin ID who created the menu type
    allowNull: false,
  },

}, {
  timestamps: true,
  tableName: "storeStock",
});
StoreStock.belongsTo(InventoryItem, {
  foreignKey: "inventoryItemId",
  as: "InventoryItem",
});
// StoreStock.belongsTo(InventoryCatagory, {
//   foreignKey: "categoryId",
//   as: "category",
// });

export default StoreStock;
