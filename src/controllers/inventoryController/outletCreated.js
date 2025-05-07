// File: controllers/outletController.js

import Outlet from '../../models/outlet.js';

// ✅ CREATE a new outlet
export const createOutlet = async (req, res) => {
  try {
    const { name, linkiedIp } = req.body;
    const createdby = req.user?.id;

    if (!name ) {
      return res.status(400).json({ message: 'Name and createdby are required.' });
    }

    const outlet = await Outlet.create({ name, linkiedIp, createdby });
    return res.status(201).json({ message: 'Outlet created successfully.', data: outlet });
  } catch (error) {
    console.error('Error creating outlet:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ READ all outlets
export const getAllOutlets = async (req, res) => {
    try {
      const createdby = req.user?.id;
  
      if (!createdby) {
        return res.status(401).json({ message: 'Unauthorized: Missing user info.' });
      }
  
      const outlets = await Outlet.findAll({ where: { createdby } });
  
      return res.status(200).json({ data: outlets });
    } catch (error) {
      console.error('Error fetching outlets:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  };
  

// ✅ READ one outlet by ID
export const getOutletById = async (req, res) => {
  try {
    const { id } = req.params;
    const outlet = await Outlet.findByPk(id);

    if (!outlet) {
      return res.status(404).json({ message: 'Outlet not found.' });
    }

    return res.status(200).json({ data: outlet });
  } catch (error) {
    console.error('Error fetching outlet:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ UPDATE an outlet
export const updateOutlet = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, linkiedIp } = req.body;

    const outlet = await Outlet.findByPk(id);
    if (!outlet) {
      return res.status(404).json({ message: 'Outlet not found.' });
    }

    outlet.name = name || outlet.name;
    outlet.linkiedIp = linkiedIp || outlet.linkiedIp;

    await outlet.save();

    return res.status(200).json({ message: 'Outlet updated successfully.', data: outlet });
  } catch (error) {
    console.error('Error updating outlet:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ DELETE an outlet
export const deleteOutlet = async (req, res) => {
  try {
    const { id } = req.params;

    const outlet = await Outlet.findByPk(id);
    if (!outlet) {
      return res.status(404).json({ message: 'Outlet not found.' });
    }

    await outlet.destroy();
    return res.status(200).json({ message: 'Outlet deleted successfully.' });
  } catch (error) {
    console.error('Error deleting outlet:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
