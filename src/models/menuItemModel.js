import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./userModel.js";
import Menu from "./menuModel.js";

const MenuItem = sequelize.define("MenuItem", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true },
  },
  menuId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Menus",
      key: "id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
  basePrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true, // only if no variations
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "",
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
});

// Associations
User.hasMany(MenuItem, { foreignKey: "createdBy", onDelete: "CASCADE" });
MenuItem.belongsTo(User, { foreignKey: "createdBy" });

Menu.hasMany(MenuItem, { foreignKey: "menuId", onDelete: "CASCADE" });
MenuItem.belongsTo(Menu, { foreignKey: "menuId", onDelete: "CASCADE" });

export default MenuItem;
