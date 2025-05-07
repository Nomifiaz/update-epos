import { sequelize } from '../config/db.js'
import { DataTypes } from 'sequelize'
import Branch from './branch.js'
import Ingredient from './Ingredient.js'

const BranchStock = sequelize.define(
  'BranchStock',
  {
    branch_id: { type: DataTypes.INTEGER, references: { model: Branch, key: 'id' } },
    ingredient_id: { type: DataTypes.INTEGER, references: { model: Ingredient, key: 'id' } },
    quantity: { type: DataTypes.FLOAT },
    received_from_store: { type: DataTypes.DATE },
    received_from_another_supplier: { type: DataTypes.BOOLEAN },
    expiry_date: { type: DataTypes.DATE },
    last_updated_by: { type: DataTypes.INTEGER },
  },
  { timestamps: true },
)

// Define relationships
Branch.hasMany(BranchStock, { foreignKey: 'branch_id' })
Ingredient.hasMany(BranchStock, { foreignKey: 'ingredient_id' })

export default BranchStock
