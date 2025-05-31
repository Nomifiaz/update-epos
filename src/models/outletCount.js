import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import InventoryItem from "./inventoryItem.js";
import Outlet from "./outlet.js";

const OutletCount = sequelize.define("outletCount", {
  inventoryItemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  outletId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.DECIMAL,
    allowNull: false,
    defaultValue: 0, // Default stock is zero initially
  },
  createdBy: {
    type: DataTypes.INTEGER, // Admin ID who created the menu type
    allowNull: false,
  },  
}, {
  timestamps: true,
  tableName: "outletCount",
});
OutletCount.belongsTo(InventoryItem, {
  foreignKey: "inventoryItemId",
  as: "InventoryItem",
});

OutletCount.belongsTo(Outlet, {
  foreignKey: "outletId",
  as: "Outlet",
});
export default OutletCount;
