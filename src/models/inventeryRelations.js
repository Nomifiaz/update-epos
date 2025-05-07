import InventoryItem from "./inventoryItem.js";
import InventoryCatagory from "./inventoryCatagory.js";
import Supplier from "./Supplier.js";
import StockIn from "./stockIn.js";
import User from "./userModel.js";
import Units from "./units.js"; // Assuming you have a Unit model defined
import Sections from "./sections.js"; 
import StoreWastage from "./storeWastage.js";
// Associations
// Associations
// associations.js (a separate file for model relationships)
import Outlet from "./outlet.js";
import TransferStock from "./TransferStock.js";
import returnStock from "./stockReturn.js";
import OutletWastage from "./outletwastage.js";
import stockReturnToSupplier from "./ReturnTosupplier.js";

Sections.hasMany(TransferStock, {
  foreignKey: 'sectionId',
  as: 'transfers',
});

TransferStock.belongsTo(Sections, {
  foreignKey: 'sectionId',
  as: 'section', // Matches your original query
});
// return stocks relations ..................................




InventoryItem.hasMany(TransferStock, {
  foreignKey: 'inventoryItemId',
  as: 'stockTransfers', // Different alias to avoid conflict with other relations
});

TransferStock.belongsTo(InventoryItem, {
  foreignKey: 'inventoryItemId',
  as: 'InventoryItem', // Matches your original query include
});
User.hasMany(TransferStock, {
  foreignKey: 'createdBy',
  as: 'createdTransfers',
});

TransferStock.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'CreatedBy', // Matches your original query
});



Outlet.hasMany(TransferStock, {
    foreignKey: 'outletId',
    as: 'transfers'
});

TransferStock.belongsTo(Outlet, {
    foreignKey: 'outletId',
    as: 'outlet'
});
InventoryItem.hasMany(TransferStock, {
  foreignKey: 'inventoryItemId',
  as: 'transfers'
});

TransferStock.belongsTo(InventoryItem, {
  foreignKey: 'inventoryItemId',
  as: 'inventoryItem'  // Singular form for belongsTo
});



InventoryItem.belongsTo(InventoryCatagory, { foreignKey: "categoryId", as: "category" });
InventoryCatagory.hasMany(InventoryItem, { foreignKey: "categoryId" });
InventoryItem.belongsTo(Sections, { foreignKey: "sectionId", as: "section" });
Sections.hasMany(InventoryItem, { foreignKey: "sectionId" });

InventoryItem.belongsTo(Units, { foreignKey: "purchaseUnitId", as: "purchaseUnit" });
InventoryItem.belongsTo(Units, { foreignKey: "saleUnitId", as: "saleUnit" });
Units.hasMany(InventoryItem, { foreignKey: 'purchaseUnitId', as: 'inventoryItems' });

Supplier.hasMany(StockIn, { foreignKey: 'supplierId' });
StockIn.belongsTo(Supplier, { foreignKey: 'supplierId' });

StockIn.belongsTo(User, { 
  foreignKey: 'createdBy',
  as: 'CreatedBy'
});
User.hasMany(StockIn, { 
  foreignKey: 'createdBy',
  as: 'StockIns'
});

InventoryItem.hasMany(StockIn, { foreignKey: 'inventoryItemId' });
StockIn.belongsTo(InventoryItem, { foreignKey: 'inventoryItemId', as: 'InventoryItem' });

//..................................................................return stocks relations
returnStock.belongsTo(Outlet, {
  foreignKey: 'outletId',
  as: 'outlet',
});
Outlet.hasMany(returnStock, {
  foreignKey: 'outletId',
  as: 'returnStocks',
});

// ReturnStock belongsTo InventoryItem
returnStock.belongsTo(InventoryItem, {
  foreignKey: 'inventoryItemId',
  as: 'inventoryItem',
});
InventoryItem.hasMany(returnStock, {
  foreignKey: 'inventoryItemId',
  as: 'returnStocks',
});

// ReturnStock belongsTo Sections
returnStock.belongsTo(Sections, {
  foreignKey: 'sectionId',
  as: 'section',
});
Sections.hasMany(returnStock, {
  foreignKey: 'sectionId',
  as: 'returnStocks',
});

// ReturnStock belongsTo User (createdBy)
returnStock.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'createdByUser',
});
User.hasMany(returnStock, {
  foreignKey: 'createdBy',
  as: 'createdReturnStocks',
});
//...................stock wastage relations..................
OutletWastage.belongsTo(Outlet, {
  foreignKey: 'outletId',
  as: 'outlet',
});
Outlet.hasMany(OutletWastage, {
  foreignKey: 'outletId',
  as: 'wastages',
});
OutletWastage.belongsTo(InventoryItem, {
  foreignKey: 'inventoryItemId',
  as: 'inventoryItem',
});
InventoryItem.hasMany(OutletWastage, {
  foreignKey: 'inventoryItemId',
  as: 'wastages',
});
OutletWastage.belongsTo(Sections, {
  foreignKey: 'sectionId',
  as: 'wastageSection',
});
Sections.hasMany(OutletWastage, {
  foreignKey: 'sectionId',
  as: 'wastages',
});
OutletWastage.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'createdByUser',
});
User.hasMany(OutletWastage, {
  foreignKey: 'createdBy',
  as: 'wastages',
});

//.....................................storewastege relations

StoreWastage.belongsTo(InventoryItem, {
  foreignKey: 'inventoryItemId',
  as: 'inventoryItem',
});
InventoryItem.hasMany(StoreWastage, {
  foreignKey: 'inventoryItemId',
  as: 'storeWastages',
});
StoreWastage.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'createdByUser',
});
User.hasMany(StoreWastage, {
  foreignKey: 'createdBy',
  as: 'storeWastages',
});
// retturn to supplier relations 
stockReturnToSupplier.belongsTo(InventoryItem, {
  foreignKey: 'inventoryItemId',
  as: 'inventoryItem',
});
InventoryItem.hasMany(stockReturnToSupplier, {
  foreignKey: 'inventoryItemId',
  as: 'returnToSuppliers',
});
stockReturnToSupplier.belongsTo(Supplier, {
  foreignKey: 'SupplierId',
  as: 'Supplier',
});
Supplier.hasMany(stockReturnToSupplier, {
  foreignKey: 'SupplierId',
  as: 'returnToSuppliers',
});

stockReturnToSupplier.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'createdByUser',
});
User.hasMany(stockReturnToSupplier, {
  foreignKey: 'createdBy',
  as: 'returnToSuppliers',
});


export {
  InventoryItem,
  InventoryCatagory,
  Units,
  Supplier,
  StockIn,
  User,
  Outlet,
  TransferStock,
  Sections,
  returnStock,
  OutletWastage,
  StoreWastage,
  stockReturnToSupplier
};
