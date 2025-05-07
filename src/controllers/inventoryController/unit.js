import Units from '../../models/units.js'

// CREATE a unit
export const createUnit = async (req, res) => {
  try {
    const { code, name } = req.body
    const unit = await Units.create({ code, name })
    res.status(201).json({ success: true, data: unit })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating unit', error: error.message })
  }
}

// GET all units
export const getAllUnits = async (req, res) => {
  try {
    const units = await Units.findAll()
    res.status(200).json({ success: true, data: units })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching units', error: error.message })
  }
}

// GET a single unit by ID
export const getUnitById = async (req, res) => {
  try {
    const { id } = req.params
    const unit = await Units.findByPk(id)
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' })
    }
    res.status(200).json({ success: true, data: unit })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching unit', error: error.message })
  }
}

// UPDATE a unit
export const updateUnit = async (req, res) => {
  try {
    const { id } = req.params
    const { code, name } = req.body

    const unit = await Units.findByPk(id)
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' })
    }

    await unit.update({ code, name })
    res.status(200).json({ success: true, message: 'Unit updated successfully', data: unit })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating unit', error: error.message })
  }
}

// DELETE a unit
export const deleteUnit = async (req, res) => {
  try {
    const { id } = req.params

    const unit = await Units.findByPk(id)
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unit not found' })
    }

    await unit.destroy()
    res.status(200).json({ success: true, message: 'Unit deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting unit', error: error.message })
  }
}
