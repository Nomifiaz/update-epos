// File: models/stockIn.js

import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Supplier from "./Supplier.js";
import User from "./userModel.js";

const StockIn = sequelize.define("StockIn", {
  grnNo: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true, // Unique GRN number
  },
  
  supplierId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  grnDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  remarks: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  inventoryItemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  purchaseRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  itemCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  totalPurchase: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  }
}, {
  timestamps: true,
  tableName: "stockIn",
});

StockIn.associate = (models) => {
  StockIn.belongsTo(models.Supplier, { foreignKey: 'supplierId' }); // Correct association to Supplier
  StockIn.belongsTo(models.User, { foreignKey: 'createdBy' }); // Correct association to User (addedBy -> createdBy)
};

export default StockIn;
