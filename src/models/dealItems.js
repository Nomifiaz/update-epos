import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const DealItem = sequelize.define('DealItem', {
  dealId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Deals', // table name (not model name)
      key: 'id',
    },
    onDelete: 'CASCADE',
  },

  menuId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  menuItemVariationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: true,
});

export default DealItem;
