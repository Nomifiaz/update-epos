import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js"// Assuming you have a InventoryItem model defined
const Units = sequelize.define(
  "Units",
  {
    code: {
      type: DataTypes.STRING,
      allowNull: true, 
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  },
  {
    tableName: "units",
  }
)
export default Units