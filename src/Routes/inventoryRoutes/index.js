import express from 'express'
import {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from '../../controllers/inventoryController/supplier.js'
import { authenticateToken } from '../../middleware/authenticate.js'

// Units
import {
  createUnit,
  getAllUnits,
  getUnitById,
  updateUnit,
  deleteUnit,
} from '../../controllers/inventoryController/unit.js'

// Category
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../../controllers/inventoryController/catagory.js'

// Inventory Items
import {
  createInventoryItem,
  getAllInventoryItems,
  getInventoryItemById,
  updateInventoryItem,
  deleteInventoryItem,
} from '../../controllers/inventoryController/inventoryItems.js'

// Sections
import {
  createSection,
  getAllSections,
  getSectionById,
  updateSection,
  deleteSection,
} from '../../controllers/inventoryController/sections.js'

// Stock In
import { 
  createStockIn, 
  getAllStockIn, 
  getItemWiseStockInReport, 
  getStockInById, 
  getStockInReport 
} from '../../controllers/inventoryController/stockIn.js'

// Outlet Transfer
import { 
  getAllTransfers, 
  getmangerwise, 
  getStockTransforReport, 
  getTransferById, 
  outletTransfer 
} from '../../controllers/inventoryController/outletTransfer.js'

// Outlet Created
import { 
  createOutlet, 
  deleteOutlet, 
  getAllOutlets, 
  getOutletById, 
  updateOutlet 
} from '../../controllers/inventoryController/outletCreated.js'

// Outlet Return
import { 
  getAllReturnStocks, 
  getAllReturnStocksReports, 
  returnStocks 
} from '../../controllers/inventoryController/outletReturn.js'

// Outlet Wastage
import { 
  addWastage, 
  getAllWastageItems, 
  getAllWastageItemsReports 
} from '../../controllers/inventoryController/outletWastage.js'

// Store Wastage
import { 
  addStoreWastage, 
  getAllWastageStore, 
  getStoreWastageReport 
} from '../../controllers/inventoryController/storeWastage.js'

// Return to Supplier
import { 
  getAllStocksReturnToSupplier, 
  getStoreOutReport, 
  ReturnTosupplier, 
  getStoreHistoryReport 
} from '../../controllers/inventoryController/ReturnToSupplier.js'

// Store & Outlet Count
import { getStoreCount } from '../../controllers/inventoryController/storeCount.js'
import { getOutletCount } from '../../controllers/inventoryController/outletStore.js'

// Permission middleware
import { checkPermission } from '../../middleware/checkDynamicPermission.js'

const router = express.Router()

// Supplier
router.post('/creat', authenticateToken, checkPermission('addSupplier',"inventery-init-setting"), createSupplier)
router.get('/List', authenticateToken, checkPermission('viewSupplier',"inventery-init-setting"), getAllSuppliers)
router.get('/List/:id', authenticateToken, checkPermission('viewSupplier',"inventery-init-setting"), getSupplierById)
router.put('/update/:id', authenticateToken, checkPermission('updateSupplier',"inventery-init-setting"),updateSupplier)
router.delete('/delete/:id', authenticateToken, checkPermission('deleteSupplier',"inventery-init-setting"),deleteSupplier,)

// Units
router.post('/addUnit', authenticateToken, checkPermission('addUnit',"inventery-init-setting"), createUnit)
router.get('/unitList', authenticateToken, checkPermission('viewUnit',"inventery-init-setting"), getAllUnits)
router.get('/unitList/:id', authenticateToken, checkPermission('viewUnit',"inventery-init-setting"), getUnitById)
router.put('/unitUpdate/:id', authenticateToken,checkPermission('updateUnit',"inventery-init-setting"),updateUnit)
router.delete('/unitdelete/:id', authenticateToken, checkPermission('deleteUnit',"inventery-init-setting"),deleteUnit)

// Category
router.post('/addCatagory', authenticateToken, checkPermission('addCategory',"inventery-init-setting"), createCategory)
router.get('/catagoryList', authenticateToken, checkPermission('viewCategory',"inventery-init-setting"), getAllCategories)
router.get('/catagoryList/:id', authenticateToken, checkPermission('viewCategory',"inventery-init-setting"), getCategoryById)
router.put('/catagoryUpdate/:id', authenticateToken, checkPermission('updateCategory',"inventery-init-setting"),updateCategory)
router.delete('/catagorydelete/:id', authenticateToken, checkPermission('deleteCategory',"inventery-init-setting"),deleteCategory)

// Inventory Items
router.post('/addItem', authenticateToken, checkPermission('addItem',"inventery-init-setting"), createInventoryItem)
router.get('/itemList', authenticateToken, checkPermission('viewItem',"inventery-init-setting"), getAllInventoryItems)
router.get('/itemList/:id', authenticateToken, checkPermission('viewItem',"inventery-init-setting"), getInventoryItemById)
router.put('/itemUpdate/:id', authenticateToken, checkPermission('updateItem',"inventery-init-setting"),updateInventoryItem)
router.delete('/itemdelete/:id', authenticateToken, checkPermission('deleteItem',"inventery-init-setting"),deleteInventoryItem)

// Sections
router.post('/addSection', authenticateToken, checkPermission('addSection',"inventery-init-setting"), createSection)
router.get('/sectionList', authenticateToken, checkPermission('viewSection',"inventery-init-setting"), getAllSections)
router.get('/sectionList/:id', authenticateToken, checkPermission('viewSection',"inventery-init-setting"), getSectionById)
router.put('/sectionUpdate/:id', authenticateToken,checkPermission('updateSection',"inventery-init-setting"), updateSection)
router.delete('/sectiondelete/:id', authenticateToken, checkPermission('deleteSection',"inventery-init-setting"),deleteSection)

// Stock In
router.post('/createStockin', authenticateToken, checkPermission('addStockin',"inventerysetting"), createStockIn)
router.get('/stockinList', authenticateToken, checkPermission('viewStockin',"inventerysetting"), getAllStockIn)
router.get('/stockinList', authenticateToken, checkPermission('viewStockin',"inventerysetting"), getAllStockIn)
router.get('/stockinList/:id', authenticateToken, checkPermission('viewStockin',"inventerysetting"), getStockInById)
router.get('/stockinReport', authenticateToken, checkPermission('viewStockinReport',"view-All-reports"), getStockInReport)
router.get('/stockinItemReports', authenticateToken, checkPermission('viewItemWiseStockinReport',"view-All-reports"), getItemWiseStockInReport)

// Outlet Transfer
router.post('/outletTransfer', authenticateToken, checkPermission('addOutletTransfer',"inventerysetting"), outletTransfer)
router.get('/outletTransferList', authenticateToken, checkPermission('viewOutletTransfer',"inventerysetting"), getAllTransfers)
router.get('/outletTransferList/:id', authenticateToken, checkPermission('viewOutletTransfer',"inventerysetting"), getTransferById)
router.get('/outletTransferReport', authenticateToken, checkPermission('viewOutletTransferReport',"view-All-reports"), getStockTransforReport)

// Outlet Created
router.post('/outletCreated', authenticateToken, checkPermission('addOutlet',"inventerysetting","inventery-init-setting"), createOutlet)
router.get('/outletCreatedList', authenticateToken, checkPermission('viewOutlet',"inventerysetting","inventery-init-setting"), getAllOutlets)
router.get('/outletCreatedList/:id', authenticateToken, checkPermission('viewOutlet',"inventerysetting","inventery-init-setting"), getOutletById)
router.put('/outletCreatedUpdate/:id', authenticateToken, checkPermission('updateOutlet',"inventerysetting","inventery-init-setting"),updateOutlet)
router.delete('/outletCreateddelete/:id', authenticateToken, checkPermission('deleteOutlet',"inventerysetting","inventery-init-setting"),deleteOutlet)

// Outlet Return
router.post('/outletReturn', authenticateToken, checkPermission('addOutletReturn',"inventerysetting"), returnStocks)
router.get('/outletReturnList', authenticateToken, checkPermission('viewOutletReturn',"inventerysetting"), getAllReturnStocks)
router.get('/stockReturnReport', authenticateToken, checkPermission('viewReturnStockReport',"view-All-reports"), getAllReturnStocksReports)

// Outlet Wastage
router.post('/outletWastage', authenticateToken, checkPermission('addOutletWastage',"inventerysetting"), addWastage)
router.get('/outletWastageList', authenticateToken, checkPermission('viewOutletWastage',"inventerysetting"), getAllWastageItems)
router.get('/wastageReport', authenticateToken, checkPermission('viewWastageReport',"view-All-reports"), getAllWastageItemsReports)

// Store Wastage
router.post('/storeWastage', authenticateToken, checkPermission('addStoreWastage',"inventerysetting"), addStoreWastage)
router.get('/storeWastageList', authenticateToken, checkPermission('viewStoreWastage',"inventerysetting"), getAllWastageStore)
router.get('/storeWastageReport', authenticateToken, checkPermission('viewStoreWastageReport',"view-All-reports"), getStoreWastageReport)

// Return to Supplier
router.post('/returnStocks', authenticateToken, checkPermission('addReturnToSupplier',"inventerysetting"), ReturnTosupplier)
router.get('/returnStocksList', authenticateToken, checkPermission('viewReturnToSupplier',"inventerysetting"), getAllStocksReturnToSupplier)
router.get('/returnStocksReport', authenticateToken, checkPermission('viewReturnToSupplierReport',"view-All-reports"), getStoreOutReport)
router.get('/storeHistoryReport', authenticateToken, checkPermission('viewStoreHistoryReport',"view-All-reports"), getStoreHistoryReport)

// Store & Outlet Counts
router.get('/storeCount', authenticateToken, checkPermission('viewStoreCount',"inventerysetting"), getStoreCount)
router.get('/outletCount', authenticateToken, checkPermission('viewOutletCount',"inventerysetting"), getOutletCount)

// Manager-wise Outlet Stock
router.get('/managerOutlet', authenticateToken, checkPermission('viewManagerOutlet'), getmangerwise)

export default router
