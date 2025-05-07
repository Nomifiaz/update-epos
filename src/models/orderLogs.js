import { sequelize } from '../config/db.js'
import { DataTypes } from 'sequelize'
import User from './userModel.js'

const OrderLogs = sequelize.define(
  'OrderLogs',
  {
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    operation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id',
      },
    },
    time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  { timestamps: true },
)

export default OrderLogs
