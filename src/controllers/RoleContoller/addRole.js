import Role from "../../models/role.js";

export const addRoles = async (req, res) => {
  try {
    const { name } = req.body;
    const role = await Role.create({ name });
    res.status(201).json(role);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Failed to add role" });
  }
};
//fatch all roles
 export const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.status(200).json({message:"successfull",roles});
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: "Failed to fetch roles" });
  }
};
// update role
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    role.name = name;
    await role.save();

    res.status(200).json(role);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to update role" });
  }
};
//delete role
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    await role.destroy();
    res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to delete role" });
  }
};