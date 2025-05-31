import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import Role from "./role.js";

const Task = sequelize.define("task", {
  code: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: "tasks"
});
 Task.associate = (models) => {
    Task.belongsToMany(models.Role, {
      through: 'permissions',
      foreignKey: 'taskId',
    });
  };

export default Task;
