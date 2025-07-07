import { Sequelize } from 'sequelize'
import config from './config.js'

// Create Sequelize instance with connection pooling
export const sequelize = new Sequelize(config.mySqlUri, {
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})

// Connect to the database
const connectDB = async () => {
  try {
    await sequelize.authenticate()
    console.log('✅ Database connected successfully')
    // await sequelize.sync({ alter: true }) // Optional: sync models
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    process.exit(1)
  }
}

export default connectDB
