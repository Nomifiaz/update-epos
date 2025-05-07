import Waiter from "../../models/waiter.js";
import User from "../../models/userModel.js";

// Create a new waiter (Only admin and superAdmin can create)
export const createWaiter = async (req, res) => {
  try {
    const { name } = req.body;
    const adminID = req.user.id;

    // Check if user is an admin or superAdmin
    if (req.user.role !== "admin" && req.user.role !== "superAdmin") {
      return res.status(403).json({ message: "Unauthorized to create a waiter" });
    }

    // Create a waiter
    const waiter = await Waiter.create({ name, createdBy: adminID });

    res.status(201).json({ message: "Waiter created successfully", waiter });
  } catch (error) {
    console.error("Error creating waiter:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Get all waiters (Admins can see their own created waiters, SuperAdmins can see all)
export const getAllWaiters = async (req, res) => {
  try {
      const userID = req.user.id;
      const userRole = req.user.role;

      let waiters;

      if (userRole === "superAdmin") {
          // SuperAdmin sees all waiters
          waiters = await Waiter.findAll();
      } else if (userRole === "admin") {
          // Admin sees only the waiters they created
          waiters = await Waiter.findAll({ where: { createdBy: userID } });
      } else if (userRole === "cashier") {
          // Cashier sees waiters created by their admin
          const cashier = await User.findOne({
              where: { id: userID },
              attributes: ["addedBy"], // Only fetch the addedBy field
          });

          if (!cashier || !cashier.addedBy) {
              return res.status(403).json({ message: "Unauthorized" });
          }

          waiters = await Waiter.findAll({ where: { createdBy: cashier.addedBy } });
      } else {
          return res.status(403).json({ message: "Unauthorized role" });
      }

      return res.status(200).json({
          success: true,
          message: "Waiters fetched successfully",
          waiters,
      });
  } catch (error) {
      console.error("Error fetching waiters:", error);
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Get a single waiter by ID (Only if the requester is authorized)
export const getWaiterById = async (req, res) => {
  try {
    const { id } = req.params;
    const waiter = await Waiter.findByPk(id);

    if (!waiter) {
      return res.status(404).json({ message: "Waiter not found" });
    }

    // Only superAdmin or the admin who created the waiter can view it
    if (req.user.role !== "superAdmin" && waiter.createdBy !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to access this waiter" });
    }

    return res.status(200).json({ waiter });
  } catch (error) {
    console.error("Error fetching waiter:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Update waiter details (Only the admin who created it or superAdmin can update)
export const updateWaiter = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const waiter = await Waiter.findByPk(id);
    if (!waiter) {
      return res.status(404).json({ message: "Waiter not found" });
    }

    if (req.user.role !== "superAdmin" && waiter.createdBy !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to update this waiter" });
    }

    waiter.name = name || waiter.name;
    await waiter.save();

    return res.status(200).json({ message: "Waiter updated successfully", waiter });
  } catch (error) {
    console.error("Error updating waiter:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Delete a waiter (Only the admin who created it or superAdmin can delete)
export const deleteWaiter = async (req, res) => {
  try {
    const { id } = req.params;
    const waiter = await Waiter.findByPk(id);

    if (!waiter) {
      return res.status(404).json({ message: "Waiter not found" });
    }

    if (req.user.role !== "superAdmin" && waiter.createdBy !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to delete this waiter" });
    }

    await waiter.destroy();
    return res.status(200).json({ message: "Waiter deleted successfully" });
  } catch (error) {
    console.error("Error deleting waiter:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// Get all cashiers (Admins can see their own created cashiers)
export const getCashiersForAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized to view cashiers" });
    }

    const cashiers = await User.findAll({ where: { addedBy: req.user.id, role: "cashier" } });

    return res.status(200).json({ success: true, message: "Cashiers retrieved successfully", cashiers });
  } catch (error) {
    console.error("Error fetching cashiers:", error);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
