import express from "express";
import { registerTable, getAllAvailableTables, deleteTable } from "../../controllers/tableController/table.js";

const router = express.Router();

router.post("/register", registerTable); 
router.get("/all", getAllAvailableTables); 
router.delete("/delete/:id", deleteTable); 

export default router;
