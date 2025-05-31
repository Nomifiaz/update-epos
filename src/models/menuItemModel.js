import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./userModel.js";

const MenuItem = sequelize.define(
  "MenuItem",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    menuId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Menus",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    recipeId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Recipes",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    basePrice: {
      type: DataTypes.DECIMAL(10, 2), // Base price if no sizes are provided
      allowNull: true,
    },
    smallPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true, // Can be null if not applicable
    },
    mediumPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    largePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    image: {
      type: DataTypes.STRING,
      defaultValue: "",
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.INTEGER, // Admin ID who created the menu item
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  { timestamps: true }
);

User.hasMany(MenuItem, { foreignKey: "createdBy", onDelete: "CASCADE" });
MenuItem.belongsTo(User, { foreignKey: "createdBy" });

import Menu from "./menuModel.js"; // 👈 import Menu
import Recipe from "./recipeModel.js";

Menu.hasMany(MenuItem, {
  foreignKey: "menuId",
  onDelete: "CASCADE",
});
MenuItem.belongsTo(Menu, {
  foreignKey: "menuId",
  onDelete: "CASCADE",
});
// models/MenuItem.js
MenuItem.belongsTo(Recipe, {
  foreignKey: 'recipeId',
  as: 'recipe'
});

// models/Recipe.js
Recipe.hasMany(MenuItem, {
  foreignKey: 'recipeId',
  as: 'menuItems'
});


export default MenuItem;
