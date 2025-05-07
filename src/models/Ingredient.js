import { sequelize } from '../config/db.js'
import { DataTypes } from 'sequelize'

const Ingredient = sequelize.define(
  'Ingredient',
  {
    name: { type: DataTypes.STRING, allowNull: false },
    unit: { type: DataTypes.STRING },
    category: { type: DataTypes.STRING },
  },
  { timestamps: true },
)

export default Ingredient
