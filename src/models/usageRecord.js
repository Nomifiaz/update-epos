import { sequelize } from '../config/db.js'
import { DataTypes } from 'sequelize'
import Branch from './branch.js'
import Ingredient from './ingredient.js'
import Menu from './menuModel.js'
import MenuItem from './menuItemModel.js'

const UsageRecord = sequelize.define('UsageRecord', {
  branch_id: { type: DataTypes.INTEGER, references: { model: Branch, key: 'id' } },
  ingredient_id: { type: DataTypes.INTEGER, references: { model: Ingredient, key: 'id' } },
  quantity_used: { type: DataTypes.FLOAT },
  menu_item_id: { type: DataTypes.INTEGER, references: { model: Menu, key: 'id' } },
  menu_id: { type: DataTypes.INTEGER, references: { model: MenuItem, key: 'id' } },
  date_used: { type: DataTypes.DATE },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
})

// Define relationships
Branch.hasMany(UsageRecord, { foreignKey: 'branch_id' })
Ingredient.hasMany(UsageRecord, { foreignKey: 'ingredient_id' })

export default UsageRecord
