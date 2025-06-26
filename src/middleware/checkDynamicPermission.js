import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import Permission from '../models/role_permissions.js';
import Role from '../models/role.js';
import Task from '../models/task.js';
import Outlet from '../models/outlet.js';
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
// export const checkPermission = (...taskCodes) => {
//   return async (req, res, next) => {
//     try {
//       const userId = req.user.id;

//       // Step 1: Get user and role
//       const user = await User.findByPk(userId, {
//         include: { model: Role, attributes: ['id', 'name'] }
//       });

//       if (!user || !user.role) {
//         return res.status(403).json({ message: 'Access denied: Role not found' });
//       }

//       const roleId = user.roleId;
//       const roleName = user.role.name;
//       let outletId = null;

//       // Step 2: Determine outlet based on role
//       if (roleName === 'manager') {
//         const outlet = await Outlet.findOne({ where: { managerId: user.id } });
//         if (!outlet) {
//           return res.status(403).json({ message: 'Access denied: Manager has no outlet' });
//         }
//         outletId = outlet.id;
//       } else if (roleName === 'cashier') {
//         // Get the manager who created this cashier
//         const manager = await User.findByPk(user.addedBy);
//         if (!manager) {
//           return res.status(403).json({ message: 'Access denied: Cashier creator (manager) not found' });
//         }

//         const outlet = await Outlet.findOne({ where: { managerId: manager.id } });
//         if (!outlet) {
//           return res.status(403).json({ message: 'Access denied: Manager has no outlet' });
//         }
//         outletId = outlet.id;
//       }

//       // Step 3: Fetch permissions with roleId + (if needed) outletId
//       const where = {
//         roleId,
//         ...(outletId ? { outletId } : {}) // only apply outletId if set
//       };

//       const permissions = await Permission.findAll({
//         where,
//         include: {
//           model: Task,
//           attributes: ['code']
//         }
//       });

//       const userTaskCodes = permissions.map(p => p.task?.code).filter(Boolean);

//       // Step 4: Full access
//       if (userTaskCodes.includes('all_permissions')) {
//         console.log('✅ Full access via all_permissions');
//         return next();
//       }

//       // Step 5: Check required permission(s)
//       const hasPermission = taskCodes.some(code => userTaskCodes.includes(code));

//       if (!hasPermission) {
//         return res.status(403).json({
//           message: 'Access denied: Required permission not found',
//           required: taskCodes,
//           userHas: userTaskCodes
//         });
//       }

//       console.log('✅ Access granted for:', taskCodes);
//       next();
//     } catch (error) {
//       console.error('🔥 checkPermission error:', error.message);
//       res.status(500).json({ message: 'Internal Server Error' });
//     }
//   };
// };


