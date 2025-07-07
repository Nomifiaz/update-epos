import Outlet from '../../models/outlet.js'
// import Role from '../../models/role.js'
// import Permission from '../../models/role_permissions.js'
// import Task from '../../models/task.js'
import User from '../../models/userModel.js'
import {Role,Permission,Task} from "../../models/roleRelations.js"
export const assignPermission = async (req, res) => {  
    try {
      
        const { roleId, taskId } = req.body;
         const adminId = req.user.id
        const permission = await Permission.create({
            roleId,
            taskId,
            adminId
            
        });
        return res.status(201).json({
            status: "success",
            message: "Permission assigned successfully",
            data: permission
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message
        });
    }
}
//update permission
export const updatePermission = async (req, res) => {
  try {
    const { id } = req.params
    const { roleId, taskId } = req.body

    const permission = await Permission.findByPk(id)
    if (!permission) {
      return res.status(404).json({ error: 'Permission not found' })
    }

    permission.roleId = roleId
    permission.taskId = taskId
    await permission.save()

    return res.status(200).json({
      status: 'success',
      message: 'Permission updated successfully',
      data: permission,
    })
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
    })
  }
}
//delete permission
export const deletePermission = async (req, res) => {
  try {
    const { roleId, taskId } = req.params;

    if (!roleId || !taskId) {
      return res.status(400).json({ error: 'roleId and taskId are required' });
    }

    const permission = await Permission.findOne({ where: { roleId, taskId } });

    if (!permission) {
      return res.status(404).json({ error: 'Permission not found for the given role and task' });
    }

    await permission.destroy();

    return res.status(200).json({
      status: 'success',
      message: 'Permission deleted successfully from role',
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};


// export const getRoleByIdWithTasks = async (req, res) => {
//   const { id } = req.params; // roleId from route
//   try {
//     const role = await Role.findByPk(id, {
//       attributes: ['id', 'name'],
//       include: [
//         {
//           model: Task,
//           attributes: ['id', 'code'],
//           through: { attributes: [] }, // hide join table data
//         },
//       ],
//     });

//     if (!role) {
//       return res.status(404).json({
//         status: 'error',
//         message: 'Role not found',
//       });
//     }

//     return res.status(200).json({
//       status: 'success',
//       data: role,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: 'error',
//       message: error.message,
//     });
//   }
// };
export const getRoleByIdWithTasks = async (req, res) => {
  const { id } = req.params; // roleId from route
  const adminId = req.user.id; // assuming you have authentication

  try {
    const role = await Role.findByPk(id, {
      attributes: ['id', 'name'],
      include: [
        {
          model: Task,
          attributes: ['id', 'code'],
          through: {
            attributes: [],
            where: { adminId }, // 🔥 filter join table by adminId
          },
        },
      ],
    });

    if (!role) {
      return res.status(404).json({
        status: 'error',
        message: 'Role not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: role,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};
