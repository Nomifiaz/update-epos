import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const DeliveryBoy = sequelize.define(
  "DeliveryBoy",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    availability_status: {
      type: DataTypes.ENUM("available", "busy", "off-duty"),
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

export default DeliveryBoy;
