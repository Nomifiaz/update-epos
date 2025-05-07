import express from 'express'
import {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from '../../controllers/inventoryController/supplier.js'
import { authenticateToken } from '../../middleware/authenticate.js'
//units protins...............................
import {
  createUnit,
  getAllUnits,
  getUnitById,
  updateUnit,
  deleteUnit,
} from '../../controllers/inventoryController/unit.js'
//..................catagory...
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../../controllers/inventoryController/catagory.js'
//..............items sections ......................................
import {
  createInventoryItem,
  getAllInventoryItems,
  getInventoryItemById,
  updateInventoryItem,
  deleteInventoryItem,
} from '../../controllers/inventoryController/inventoryItems.js'
//..................sections..............................................
import {
  createSection,
  getAllSections,
  getSectionById,
  updateSection,
  deleteSection,
} from '../../controllers/inventoryController/sections.js'
import { createStockIn, getAllStockIn, getItemWiseStockInReport, getStockInById, getStockInReport } from '../../controllers/inventoryController/stockIn.js'
import { getAllTransfers, getStockTransforReport, getTransferById, outletTransfer } from '../../controllers/inventoryController/outletTransfer.js'
import { createOutlet, deleteOutlet, getAllOutlets, getOutletById, updateOutlet } from '../../controllers/inventoryController/outletCreated.js'
import { getAllReturnStocks, getAllReturnStocksReports, returnStocks } from '../../controllers/inventoryController/outletReturn.js'
import { addWastage, getAllWastageItems, getAllWastageItemsReports } from '../../controllers/inventoryController/outletWastage.js'
import { addStoreWastage, getAllWastageStore, getStoreWastageReport } from '../../controllers/inventoryController/storeWastage.js'
import { getAllStocksReturnToSupplier, getStoreOutReport, ReturnTosupplier,getStoreHistoryReport } from '../../controllers/inventoryController/ReturnToSupplier.js'



const router = express.Router()

// CREATE a supplier
router.post('/creat', authenticateToken, createSupplier)
router.get('/List', authenticateToken, getAllSuppliers)
router.get('/List/:id', getSupplierById)
router.put('/update/:id', updateSupplier)
router.delete('/delete/:id', deleteSupplier)
//units protions .................................................
router.post('/addUnit', createUnit)
router.get('/unitList', getAllUnits)
router.get('/unitList/:id', getUnitById)
router.put('/unitUpdate/:id', updateUnit)
router.delete('/unitdelete/:id', deleteUnit)
//catagory..................................................

router.post('/addCatagory', authenticateToken, createCategory)
router.get('/catagoryList', authenticateToken, getAllCategories)
router.get('/catagoryList/:id', getCategoryById)
router.put('/catagoryUpdate/:id', updateCategory)
router.delete('/catagorydelete/:id', deleteCategory)

//inventory items..............................................
router.post('/addItem', authenticateToken, createInventoryItem)
router.get('/itemList', authenticateToken, getAllInventoryItems)
router.get('/itemList/:id', getInventoryItemById)
router.put('/itemUpdate/:id', updateInventoryItem)
router.delete('/itemdelete/:id', deleteInventoryItem)

//sections..................................................
router.post('/addSection', authenticateToken, createSection)
router.get('/sectionList', authenticateToken, getAllSections)
router.get('/sectionList/:id', getSectionById)
router.put('/sectionUpdate/:id', updateSection)
router.delete('/sectiondelete/:id', deleteSection)
//stock in ...........................................
router.post("/createStockin", authenticateToken,createStockIn);
router.get("/stockinList", authenticateToken, getAllStockIn);
 router.get("/stockinList/:id", getStockInById);
 //reports store in reports ............
 router.get("/stockinReport", authenticateToken, getStockInReport);
 router.get("/stockinItemReports", authenticateToken, getItemWiseStockInReport);
// outlet transfer..............................................
 router.post('/outletTransfer', authenticateToken, outletTransfer)
router.get('/outletTransferList', authenticateToken, getAllTransfers)
router.get('/outletTransferList/:id', getTransferById)
//reports.....................
router.get('/outletTransferReport', authenticateToken, getStockTransforReport)

 //outlet crated .....................
router.post('/outletCreated', authenticateToken, createOutlet)
router.get('/outletCreatedList', authenticateToken, getAllOutlets)
router.get('/outletCreatedList/:id', getOutletById)
router.put('/outletCreatedUpdate/:id', updateOutlet) 
router.delete('/outletCreateddelete/:id', deleteOutlet)
// outlet return..............................................
 router.post('/outletReturn', authenticateToken, returnStocks)
router.get('/outletReturnList', authenticateToken, getAllReturnStocks)
// stock return reports .............
 router.get('/stockReturnReport', authenticateToken, getAllReturnStocksReports)
// outlet wastage..............................................
 router.post('/outletWastage', authenticateToken, addWastage)
router.get('/outletWastageList', authenticateToken, getAllWastageItems) 
// reports wastage items

router.get('/wastageReport', authenticateToken, getAllWastageItemsReports) 
//store stock  wastages..............................
router.post('/storeWastage', authenticateToken, addStoreWastage) 
router.get('/storeWastageList', authenticateToken, getAllWastageStore)
// reports wastage items
router.get('/storeWastageReport', authenticateToken, getStoreWastageReport)

//stock return to supplier 
 router.post('/returnStocks', authenticateToken, ReturnTosupplier)
router.get('/returnStocksList', authenticateToken, getAllStocksReturnToSupplier)
// reports store out ..........................................
router.get('/returnStocksReport', authenticateToken, getStoreOutReport)
// reports store history
router.get('/storeHistoryReport', authenticateToken, getStoreHistoryReport)
export default router
