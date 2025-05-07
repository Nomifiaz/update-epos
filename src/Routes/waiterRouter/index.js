import express from "express";
import {
  createWaiter,
  getAllWaiters,
  getWaiterById,
  updateWaiter,
  deleteWaiter
} from "../../controllers/waiterController/waiter.js";
import { authenticateToken } from "../../middleware/authenticate.js";

const router = express.Router();

// Routes
router.post("/register",authenticateToken, createWaiter); // Create waiter
router.get("/waiters",authenticateToken, getAllWaiters); // Get all waiters
router.get("/waiters/:id", authenticateToken,getWaiterById); // Get waiter by ID
router.put("/waiters/:id", authenticateToken,updateWaiter); // Update waiter
router.delete("/waiters/:id", authenticateToken,deleteWaiter); // Delete waiter

export default router;
