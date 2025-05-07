import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const InventoryCatagory = sequelize.define("InventoryCatagory", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  timestamps: true,
  tableName: "inventoryCatagory",
});

export default InventoryCatagory;
