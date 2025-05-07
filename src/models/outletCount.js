import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const outletCount = sequelize.define("outletCount", {
  inventoryItemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  outletId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0, // Default stock is zero initially
  }
}, {
  timestamps: true,
  tableName: "outletCount",
});

export default outletCount;
