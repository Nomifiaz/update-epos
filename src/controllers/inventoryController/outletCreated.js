// File: controllers/outletController.js

import Outlet from '../../models/outlet.js'
import Role from '../../models/role.js'
import User from '../../models/userModel.js'

// ✅ CREATE a new outlet
export const createOutlet = async (req, res) => {
  try {
    const { name, linkiedIp, managerId } = req.body
    const createdby = req.user?.id
    console.log('userid', createdby)
    const userRole = req.user.role

    if (!name) {
      return res.status(400).json({ message: 'Name and createdby are required.' })
    }

    const outlet = await Outlet.create({ name, linkiedIp, createdby, managerId })
    return res.status(201).json({ message: 'Outlet created successfully.', data: outlet })
  } catch (error) {
    console.error('Error creating outlet:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// ✅ READ all outlets

export const getAllOutlets = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: Missing user ID' });
    }

    // Fetch user and join role to get role name
    const user = await User.findByPk(userId, {
      include: {
        model: Role,
        attributes: ['name'], 
      },
    });
    if (!user || !user.role) {
      return res.status(403).json({ message: 'User role not found' });
    }

    let outlets;

    if (user.role.name === 'admin') {
      // Admin sees all outlets
      outlets = await Outlet.findAll();
    } else if (user.role.name === 'manager') {
      // Manager sees only their own assigned outlet(s)
      outlets = await Outlet.findAll({ where: { managerId: user.id } });
    } else {
      // Other users see only the outlets they created
      outlets = await Outlet.findAll({ where: { createdby: user.id } });
    }

    return res.status(200).json({ message: 'success', data: outlets });
  } catch (error) {
    console.error('Error fetching outlets:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// ✅ READ one outlet by ID
export const getOutletById = async (req, res) => {
  try {
    const { id } = req.params
    const outlet = await Outlet.findByPk(id)

    if (!outlet) {
      return res.status(404).json({ message: 'Outlet not found.' })
    }

    return res.status(200).json({ data: outlet })
  } catch (error) {
    console.error('Error fetching outlet:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// ✅ UPDATE an outlet
export const updateOutlet = async (req, res) => {
  try {
    const { id } = req.params
    const { name, linkiedIp } = req.body

    const outlet = await Outlet.findByPk(id)
    if (!outlet) {
      return res.status(404).json({ message: 'Outlet not found.' })
    }

    outlet.name = name || outlet.name
    outlet.linkiedIp = linkiedIp || outlet.linkiedIp

    await outlet.save()

    return res.status(200).json({ message: 'Outlet updated successfully.', data: outlet })
  } catch (error) {
    console.error('Error updating outlet:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// ✅ DELETE an outlet
export const deleteOutlet = async (req, res) => {
  try {
    const { id } = req.params

    const outlet = await Outlet.findByPk(id)
    if (!outlet) {
      return res.status(404).json({ message: 'Outlet not found.' })
    }

    await outlet.destroy()
    return res.status(200).json({ message: 'Outlet deleted successfully.' })
  } catch (error) {
    console.error('Error deleting outlet:', error)
    return res.status(500).json({ message: 'Server error', error: error.message })
  }
}
