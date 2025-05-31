import Role from "../../models/role.js";
import Permission from "../../models/role_permissions.js";
import Task from "../../models/task.js";
export const assignPermission = async (req, res) => {  
    try {
      
        const { roleId, taskId } = req.body;
        const permission = await Permission.create({
            roleId,
            taskId,
            
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
        const { id } = req.params;
        const { roleId, taskId } = req.body;

        const permission = await Permission.findByPk(id);
        if (!permission) {
            return res.status(404).json({ error: "Permission not found" });
        }

        permission.roleId = roleId;
        permission.taskId = taskId;
        await permission.save();

        return res.status(200).json({
            status: "success",
            message: "Permission updated successfully",
            data: permission
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};
//delete permission
export const deletePermission = async (req, res) => {
    try {
        const { id } = req.params;

        const permission = await Permission.findByPk(id);
        if (!permission) {
            return res.status(404).json({ error: "Permission not found" });
        }

        await permission.destroy();
        return res.status(200).json({
            status: "success",
            message: "Permission deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: error.message
        });
    }
};
export const getAllRolesWithTasks = async (req, res) => {
  try {
    const roles = await Role.findAll({
      attributes: ['id', 'name'],
      include: [
        {
          model: Task,
          attributes: ['id', 'code'],
          through: { attributes: [] }, // hides join table
        }
      ]
    });

    return res.status(200).json({
      status: 'success',
      data: roles,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};
