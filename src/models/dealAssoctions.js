// // models/index.js
// import Deal from './dealModel.js';
// import DealItem from './dealItems.js';
// import Menu from './menuModel.js';
// import MenuItem from './menuItemModel.js';
// import MenuItemVariation from './menuItemVariation.js';

// // 🔗 Set associations
// Deal.hasMany(DealItem, { foreignKey: 'dealId', onDelete: 'CASCADE' });
// DealItem.belongsTo(Deal, { foreignKey: 'dealId' });

// Menu.hasMany(DealItem, { foreignKey: 'menuId', onDelete: 'CASCADE' });
// DealItem.belongsTo(Menu, { foreignKey: 'menuId' });

// MenuItemVariation.hasMany(DealItem, { foreignKey: 'menuItemVariationId', onDelete: 'CASCADE' });
// DealItem.belongsTo(MenuItemVariation, { foreignKey: 'menuItemVariationId' });

// MenuItem.hasMany(MenuItemVariation, { foreignKey: 'menuItemId', onDelete: 'CASCADE' });
// MenuItemVariation.belongsTo(MenuItem, { foreignKey: 'menuItemId' });

// export {
//   Deal,
//   DealItem,
//   Menu,
//   MenuItem,
//   MenuItemVariation,
// };
