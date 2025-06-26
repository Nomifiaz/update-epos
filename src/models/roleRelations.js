import Role from "./role.js";
import Permission from "./role_permissions.js";
import Task from "./task.js";


// Setup associations AFTER all models are initialized
Role.belongsToMany(Task, { through:Permission , foreignKey: 'roleId' });
Task.belongsToMany(Role, { through: Permission, foreignKey: 'taskId' });

Permission.belongsTo(Role, { foreignKey: 'roleId' });
Permission.belongsTo(Task, { foreignKey: 'taskId' });

export {
  Role,
  Task,
  Permission
};
