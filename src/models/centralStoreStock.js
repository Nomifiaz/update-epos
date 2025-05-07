import { sequelize } from '../config/db.js'
import { DataTypes } from 'sequelize'
import Ingredient from './Ingredient.js'
import Supplier from './Supplier.js'

const CentralStoreStock = sequelize.define(
  'CentralStoreStock',
  {
    ingredient_id: { type: DataTypes.INTEGER, references: { model: Ingredient, key: 'id' } },
    supplier_id: { type: DataTypes.INTEGER, references: { model: Supplier, key: 'id' } },
    quantity: { type: DataTypes.FLOAT },
    unit_price: { type: DataTypes.FLOAT },
    expiry_date: { type: DataTypes.DATE },
  },
  { timestamps: true },
)

// Define relationships
Ingredient.hasMany(CentralStoreStock, { foreignKey: 'ingredient_id' })
Supplier.hasMany(CentralStoreStock, { foreignKey: 'supplier_id' })

export default CentralStoreStock
