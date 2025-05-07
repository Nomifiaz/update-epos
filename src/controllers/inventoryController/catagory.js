import InventoryCatagory from "../../models/inventoryCatagory.js";

// CREATE
export const createCategory = async (req, res) => {
  try {
    const { name, code } = req.body;
    const createdBy = req.user.id;

    const category = await InventoryCatagory.create({ name, code, createdBy });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error creating category", error: err.message });
  }
};

// READ ALL
export const getAllCategories = async (req, res) => {
    try {
      const userId = req.user.id;
  
      const categories = await InventoryCatagory.findAll({
        where: { createdBy: userId }
      });
  
      res.status(200).json({ success: true, data: categories });
    } catch (err) {
      res.status(500).json({ success: false, message: "Error fetching categories", error: err.message });
    }
  };

// READ ONE
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await InventoryCatagory.findByPk(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching category", error: err.message });
  }
};

// UPDATE
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;

    const category = await InventoryCatagory.findByPk(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    await category.update({ name, code });
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error updating category", error: err.message });
  }
};

// DELETE
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await InventoryCatagory.findByPk(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    await category.destroy();
    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting category", error: err.message });
  }
};
