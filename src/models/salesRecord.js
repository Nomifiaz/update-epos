import { sequelize } from '../config/db.js'
import { DataTypes } from 'sequelize'
import Branch from './branch.js'

const SalesRecord = sequelize.define('SalesRecord', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  branch_id: { type: DataTypes.INTEGER, references: { model: Branch, key: 'id' } },
  total_sales: { type: DataTypes.FLOAT },
  profit_margin: { type: DataTypes.FLOAT },
  number_of_transactions: { type: DataTypes.INTEGER },
  date: { type: DataTypes.DATE },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
})

// Define relationships
Branch.hasMany(SalesRecord, { foreignKey: 'branch_id' })

export default SalesRecord
