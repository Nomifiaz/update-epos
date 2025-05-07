import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Table = sequelize.define(
  "Table",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    table_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    status: {
      type: DataTypes.ENUM("available", "occupied", "reserved"),
      defaultValue: "available",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true, // Allow NULL to avoid the zero date issue
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    
  },
  {
    timestamps: true,
  }
);

export default Table;
