import express from "express"

import { MenuWiseSalesReport, CashierWiseReport, MenuItemSalesReport,DailySalesReport, DailyMenuItemsSalesReport, CashierWiseReport2, MenuItemWeeklyReport, MenuWiseReport2,WeeklySalesReport } from "../controllers/LearningController.js";
import { authenticateToken } from '../middleware/authenticate.js';
const SalesRouter = express.Router();

SalesRouter.get("/MenuWiseSalesReport", authenticateToken,MenuWiseSalesReport)

SalesRouter.get('/CashierWiseReport',authenticateToken, CashierWiseReport)
SalesRouter.get('/MenuItemSalesReport', MenuItemSalesReport)
SalesRouter.get("/DailyMenuItemsSalesReport", DailyMenuItemsSalesReport)
SalesRouter.get("/CashierWiseReportGraph", CashierWiseReport2)
SalesRouter.get("/MenuItemReportGraph", MenuItemWeeklyReport)
SalesRouter.get("/MenuWiseReportGraph", MenuWiseReport2)
SalesRouter.get("/DailySalesReport",authenticateToken, DailySalesReport)
SalesRouter.get("/WeeklySalesReport", authenticateToken, WeeklySalesReport)

export default SalesRouter;
