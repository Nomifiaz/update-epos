import Table from "../../models/table.js";

// ✅ Register a New Table
export const registerTable = async (req, res) => {
  try {
    const { table_number } = req.body;

    // Check if table number already exists
    const existingTable = await Table.findOne({ where: { table_number } });
    if (existingTable) {
      return res.status(400).json({ message: "Table number already exists!" });
    }

    // Create new table
    const newTable = await Table.create({ table_number });

    return res.status(201).json({ message: "Table registered successfully!", table: newTable });
  } catch (error) {
    console.error("Error registering table:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ✅ Get All Tables.....................................................................................
export const getAllAvailableTables = async (req, res) => {
  try {
    const availableTables = await Table.findAll({
      where: { status: "available" }, // Fetch only tables where status is 'available'
    });

    return res.status(200).json({ availableTables });
  } catch (error) {
    console.error("Error fetching available tables:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


// ✅ Delete Table by ID.................................................................................
export const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the table by ID
    const table = await Table.findByPk(id);
    if (!table) {
      return res.status(404).json({ message: "Table not found!" });
    }

    // Delete the table
    await table.destroy();

    return res.status(200).json({ message: "Table deleted successfully!" });
  } catch (error) {
    console.error("Error deleting table:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
