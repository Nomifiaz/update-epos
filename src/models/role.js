import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Task from "./task.js";

const Role = sequelize.define("role", {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: "roles"
});
Role.belongsToMany(Task, {
  through: 'permissions',
  foreignKey: 'roleId',
});

export default Role;
