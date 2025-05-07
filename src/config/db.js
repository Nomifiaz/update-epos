import { Sequelize } from 'sequelize'
import config from './config.js'

export const sequelize = new Sequelize(config.mySqlUri, {
  dialect: 'mysql',
  logging: false,
})

const connectDB = async () => {
  try {
    await sequelize.authenticate()
    console.log('connected to DATABASE')
    // await sequelize.sync({ alter: true });
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}

export default connectDB
