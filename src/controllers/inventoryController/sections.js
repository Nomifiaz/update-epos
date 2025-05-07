import Sections from '../../models/sections.js'

// Create Section
export const createSection = async (req, res) => {
  try {
    const { name, code, serverName, printerName, printerIp, program } = req.body

    const newSection = await Sections.create({
      name,
      code,
      serverName,
      printerName,
      printerIp,
      program,
      createdBy: req.user.id, // from token
    })

    res.status(201).json({
      message: 'Section created successfully',
      newSection,
    })
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Get All Sections
export const getAllSections = async (req, res) => {
  try {
    const sections = await Sections.findAll()
    res.json({ message: 'All sections successfully fatch', sections })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Get Single Section
export const getSectionById = async (req, res) => {
  try {
    const section = await Sections.findByPk(req.params.id)
    if (!section) {
      return res.status(404).json({ message: 'Section not found' })
    }
    res.json({ message: 'Section successfully fatch', section })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// Update Section
export const updateSection = async (req, res) => {
  try {
    const section = await Sections.findByPk(req.params.id)
    if (!section) {
      return res.status(404).json({ message: 'Section not found' })
    }

    await section.update(req.body)
    res.json(section)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

// Delete Section
export const deleteSection = async (req, res) => {
  try {
    const section = await Sections.findByPk(req.params.id)
    if (!section) {
      return res.status(404).json({ message: 'Section not found' })
    }

    await section.destroy()
    res.json({ message: 'Section deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
