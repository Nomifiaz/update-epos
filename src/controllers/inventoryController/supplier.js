import Supplier from '../../models/Supplier.js'

export const createSupplier = async (req, res) => {
  try {
    const {
      code,
      name,
      contactPerson,
      address,
      phone,
      email,
      mobileNo,
      openingBalance,
      closingBalance,
      region,
      ntn,
    } = req.body

    const addedBy = req.user.id

    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and Phone are required' })
    }

    const newSupplier = await Supplier.create({
      code,
      name,
      contactPerson,
      address,
      phone,
      email,
      mobileNo,
      openingBalance,
      closingBalance,
      region,
      ntn,
      addedBy,
    })

    res.status(201).json({ message: 'Supplier created successfully', supplier: newSupplier })
  } catch (error) {
    res.status(500).json({ message: 'Error creating supplier', error: error.message })
  }
}
// fatch all suppliers
export const getAllSuppliers = async (req, res) => {
  try {
    const adminId = req.user.id

    const suppliers = await Supplier.findAll({
      where: { addedBy: adminId },
      attributes: ["id",'code', 'name', 'contactPerson', 'address', 'phone', 'mobileNo']
    })

    res.status(200).json({ message: 'Suppliers fetched successfully', suppliers })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching suppliers', error: error.message })
  }
}

// Fetch a single supplier by ID
export const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params
    const supplier = await Supplier.findByPk(id)
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' })
    }
    res.status(200).json({ message: 'successfully', supplier })
  } catch (error) {
    res.status(500).json({ message: 'Error fetching supplier', error: error.message })
  }
}
// Update a supplier by ID
export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params
    const {
      code,
      name,
      contactPerson,
      address,
      phone,
      email,
      mobileNo,
      openingBalance,
      closingBalance,
      region,
      ntn,
    } = req.body
    const supplier = await Supplier.findByPk(id)
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' })
    }
    await supplier.update({
      code,
      name,
      contactPerson,
      address,
      phone,
      email,
      mobileNo,
      openingBalance,
      closingBalance,
      region,
      ntn,
    })
    res.status(200).json({ message: 'Supplier updated successfully', supplier })
  } catch (error) {
    res.status(500).json({ message: 'Error updating supplier', error: error.message })
  }
}
// Delete a supplier by ID
export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params
    const supplier = await Supplier.findByPk(id)
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' })
    }
    await supplier.destroy()
    res.status(200).json({ message: 'Supplier deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error deleting supplier', error: error.message })
  }
}
