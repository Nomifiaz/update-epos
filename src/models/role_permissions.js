import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Role from "./role.js";
import Task from "./task.js";

const Permission = sequelize.define("permission", {
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
    outletId:{
      type: DataTypes.INTEGER,
    allowNull: true
    }
}, {
  timestamps: true,
  tableName: "permissions"
});
// In Role model
//  Role.belongsToMany(Task, { through: Permission, foreignKey: 'roleId' });

// // // In Task model
// //Task.belongsToMany(Role, { through: Permission, foreignKey: 'taskId' });

export default Permission;
