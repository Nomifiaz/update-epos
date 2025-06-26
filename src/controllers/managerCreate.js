import Role from '../models/role.js'
import User from '../models/userModel.js'
import bcrypt from 'bcrypt'

export const createManager = async (req, res) => {
  try {
    const { userName, password ,roleId} = req.body
    const adminID = req.user.id
    
    

    // const hashPassword = await bcrypt.hash(password, 12)

    const newManger = await User.create({
      userName,
      password,
      roleId,
      addedBy: adminID,
    })

    res.status(201).json({ message: 'Cashier created successfully', newManger })
  } catch (error) {
    res.status(500).json({ message: 'Error creating Manger', error: error.message })
  }
}
// getexport  user
export const getAllUsersWithRoles = async (req, res) => {
  try {
    const currentUserId = req.user.id; // Extract from token

    const users = await User.findAll({
      where: { addedBy: currentUserId }, // 👈 Only show users added by current user
      attributes: ['id', 'userName', 'roleId', 'addedBy',"password"],
      include: {
        model: Role,
        attributes: ['name']  // Get role name
      }
    });

    const formattedUsers = users.map(user => ({
      id: user.id,
      userName: user.userName,
      roleId: user.roleId,
      addedBy: user.addedBy,
      roleName: user.role ? user.role.name : null,
      password:user.password
    }));

    res.status(200).json({
      message: 'Users fetched successfully',
      data: formattedUsers
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching users',
      error: error.message
    });
  }
};

export default {createManager,getAllUsersWithRoles}
