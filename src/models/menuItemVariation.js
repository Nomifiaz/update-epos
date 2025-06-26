import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import MenuItem from "./menuItemModel.js";
import Recipe from "./recipeModel.js";

const MenuItemVariation = sequelize.define("MenuItemVariation", {
  menuItemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "MenuItems", // must match DB table name
      key: "id",
    },
    onDelete: "CASCADE",
  },
  size: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  recipeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Recipes",
      key: "id",
    },
    onDelete: "CASCADE",
  },
}, {
  timestamps: true,
});

// Associations
MenuItem.hasMany(MenuItemVariation, { foreignKey: "menuItemId", onDelete: "CASCADE" });
MenuItemVariation.belongsTo(MenuItem, { foreignKey: "menuItemId" });

Recipe.hasMany(MenuItemVariation, { foreignKey: "recipeId", onDelete: "CASCADE" });
MenuItemVariation.belongsTo(Recipe, { foreignKey: "recipeId" });

export default MenuItemVariation;
