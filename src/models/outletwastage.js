// models/outletWastage.js
import {DataTypes} from 'sequelize';
import {sequelize} from '../config/db.js';
import InventoryItem from './inventoryItem.js';
import Outlet from './outlet.js';
import Sections from './sections.js';
import User from './userModel.js'; // Assuming you have a User model

const OutletWastage = sequelize.define('OutletWastage', {
  rawWastage: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  totalCostWastage: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
    createdDate: {
    type: DataTypes.DATE,
    allowNull: false,
    },
  saleUnit: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  unitCost: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  remarks: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Add createdBy and outletId as foreign keys
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  outletId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
});

// Associations
OutletWastage.belongsTo(Sections, { foreignKey: 'sectionId' });
OutletWastage.belongsTo(InventoryItem, { foreignKey: 'inventoryItemId' });
OutletWastage.belongsTo(Outlet, { foreignKey: 'outletId' });
OutletWastage.belongsTo(User, { foreignKey: 'createdBy' }); // Assuming "User" model exists and has user details

export default OutletWastage;
