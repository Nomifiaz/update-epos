import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import MenuItem from "./menuItemModel.js";

const Variation = sequelize.define("Variation", {
  menuItemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: MenuItem,
      key: "id",
    },
    onDelete: "CASCADE",
  },
  size: {
    type: DataTypes.STRING, // Example: "Small", "Medium", "Large", "XXL"
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
});

MenuItem.hasMany(Variation, { foreignKey: "menuItemId", onDelete: "CASCADE" });
Variation.belongsTo(MenuItem, { foreignKey: "menuItemId" });

export default Variation;
