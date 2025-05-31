import User from '../models/userModel.js'
import bcrypt from 'bcrypt'

const createAdmin = async (req, res) => {
  try {
    const { userName, password ,roleId} = req.body
    const adminID = req.user.id
   
    const hashPassword = await bcrypt.hash(password, 12)

    const newAdmin = await User.create({
      userName,
      password: hashPassword,
      roleId,
      addedBy: adminID,
    })

    res.status(201).json({ message: 'Cashier created successfully', newAdmin })
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin', error: error.message })
  }
}

export default createAdmin
