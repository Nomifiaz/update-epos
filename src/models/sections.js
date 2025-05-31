import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Sections = sequelize.define("sections", {
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
  },
  serverName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  printerName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  printerIp: {
    type: DataTypes.STRING,
    allowNull: true,
    
  },
  program: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  timestamps: true,
  tableName: "sections",
});

export default Sections;
