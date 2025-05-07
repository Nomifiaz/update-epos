import { sequelize } from '../config/db.js'
import { DataTypes } from 'sequelize'
import Branch from './branch.js'
import Ingredient from './ingredient.js'

const WasteRecord = sequelize.define('WasteRecord', {
  branch_id: { type: DataTypes.INTEGER, references: { model: Branch, key: 'id' } },
  ingredient_id: { type: DataTypes.INTEGER, references: { model: Ingredient, key: 'id' } },
  quantity_wasted: { type: DataTypes.FLOAT },
  reason: { type: DataTypes.TEXT },
  reported_by: { type: DataTypes.STRING },
  corrective_action: { type: DataTypes.TEXT },
  waste_category: { type: DataTypes.STRING },
  date_wasted: { type: DataTypes.DATE },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
})

// Define relationships
Branch.hasMany(WasteRecord, { foreignKey: 'branch_id' })
Ingredient.hasMany(WasteRecord, { foreignKey: 'ingredient_id' })

export default WasteRecord
