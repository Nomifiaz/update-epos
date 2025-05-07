import app from './src/app.js'
import connectDB from './src/config/db.js'
import config from './src/config/config.js'

const PORT = config.port

;(async () => {
  try {
    await connectDB()
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
})()
