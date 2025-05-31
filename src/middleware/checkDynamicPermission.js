import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Permission from '../models/role_permissions.js';
import Role from '../models/role.js';
import Task from '../models/task.js';
// middleware/checkPermission.js


// middleware/checkPermission.js
export const checkPermission = (...taskCodes) => {
  return async (req, res, next) => {
    const userId = req.user.id;

    try {
      const user = await User.findByPk(userId, {
        include: {
          model: Role,
          include: {
            model: Task,
            attributes: ['code'],
            through: { attributes: [] },
            required: false
          }
        }
      });

      if (!user || !user.role) {
        return res.status(403).json({ message: 'Access denied: No role assigned' });
      }

      const userTaskCodes = user.role.tasks.map(task => task.code);

      // ✅ Full access override
      if (userTaskCodes.includes('all_permissions')) {
        console.log("✅ Role has 'all_permissions': full access granted");
        return next();
      }

      // ✅ Check if at least one permission matches
      const hasPermission = taskCodes.some(code => userTaskCodes.includes(code));

      if (!hasPermission) {
        console.log("❌ Permission denied. Required:", taskCodes);
        console.log("🔎 User has:", userTaskCodes);
        return res.status(403).json({ message: 'Access denied: Permission missing' });
      }

      console.log("✅ Access granted with one of:", taskCodes);
      next();

    } catch (error) {
      console.error("🔥 Middleware error:", error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  };
};
