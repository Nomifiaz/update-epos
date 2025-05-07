import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Unit from "./units.js"; // Assuming you have a Unit model defined
import InventoryCatagory from "./inventoryCatagory.js";

const InventoryItem = sequelize.define("InventoryItem", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  minQty: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.0,
  },
  purchaseUnitId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  saleUnitId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  lastPurchasePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0.0,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  timestamps: true,
  tableName: "inventoryItem",
});


// InventoryItem.js

export default InventoryItem;

