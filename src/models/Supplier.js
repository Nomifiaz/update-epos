// File: models/Supplier.js

import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import StockIn from "./stockIn.js";

const Supplier = sequelize.define(
  "Supplier",
  {
    code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contactPerson: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    mobileNo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    openingBalance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.0,
    },
    closingBalance: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0.0,
    },
    region: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    addedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ntn: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "suppliers",
  }
);

Supplier.associate = (models) => {
  Supplier.hasMany(models.StockIn, { foreignKey: 'supplierId' });
};

export default Supplier;
