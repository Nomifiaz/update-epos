import User from '../models/userModel.js'
import bcrypt from 'bcrypt'

const createManager = async (req, res) => {
  try {
    const { userName, password ,roleId} = req.body
    const adminID = req.user.id
    
    

    const hashPassword = await bcrypt.hash(password, 12)

    const newManger = await User.create({
      userName,
      password: hashPassword,
      roleId,
      addedBy: adminID,
    })

    res.status(201).json({ message: 'Cashier created successfully', newManger })
  } catch (error) {
    res.status(500).json({ message: 'Error creating Manger', error: error.message })
  }
}

export default createManager
