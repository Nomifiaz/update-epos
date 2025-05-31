import User from '../models/userModel.js'

import bcrypt from 'bcrypt'

const createCashier = async (req, res) => {
  try {
    const { userName, password,roleId } = req.body
    const adminID = req.user.id

    // Encrypt password before saving
    const hashPassword = await bcrypt.hash(password, 12)

    // Create new cashier
    const newCashier = await User.create({
      userName,
      password: hashPassword,
      roleId,
      addedBy: adminID,
    })

    res.status(201).json({ message: 'Cashier created successfully', newCashier })
  } catch (error) {
    res.status(500).json({ message: 'Error creating cashier', error: error.message })
  }
}

export default createCashier
