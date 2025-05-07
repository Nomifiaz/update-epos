// models/outletWastage.js
import {DataTypes} from 'sequelize';
import {sequelize} from '../config/db.js';
const StoreWastage = sequelize.define('storeWastage', {
  rawWastage: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  inventoryItemId: {
    type: DataTypes.INTEGER,
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
 
}, {
  timestamps: true,
});

// Associations

export default StoreWastage;
