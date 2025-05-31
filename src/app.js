import express from 'express'
import path from 'path'
import morgan from 'morgan'
import cors from 'cors'
import userRoute from './Routes/authRoute.js'
import menuItemRoute from './Routes/menuItemRoute.js'
import menuRoute from './Routes/menuRoute.js'
import menuTypeRoute from './Routes/menuTypeRoute.js'
import recipeRoute from './Routes/recipeRoute.js'
import recipeTypeRoute from './Routes/recipeTypeRoute.js'
import OrderRouter from './Routes/orderRouter/index.js'
import tableRouter from './Routes/tableRouter/index.js'
import waiterRouter from './Routes/waiterRouter/index.js'
import dealRoute from './Routes/dealRoute.js'
import SalesRouter from './Routes/salesReport.js'
import errorHandler from './middleware/errorHandler.js'
import notFound from './middleware/notFound.js'
import config from './config/config.js'
import inventoryRoutes from './Routes/inventoryRoutes/index.js'
import RoleRouter from './Routes/rolePermessionRouter/index.js'

const app = express()

//Middlewares
app
  .disable('x-powered-by')
  .use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use(morgan('dev'))
  .use(cors())

const uploadPath = path.join(process.cwd(), 'uploads')
app.use('/uploads', express.static(uploadPath))

//Routes
app.get('/', (req, res) => {
  res.status(200).send({ ok: true, environment: config.env })
})

app.use('/api/report', SalesRouter)

//API Route
// auth login Register
app.use('/api/auth', userRoute)
// MenuTypes and Menu route
app.use('/api/menus', menuTypeRoute)
app.use('/api/menu', menuRoute)
app.use('/api/menu-item', menuItemRoute)
// RecipeTypes and Recipe route
app.use('/api/recipes', recipeTypeRoute)
app.use('/api/recipe', recipeRoute)

app.use('/api/order', OrderRouter)
app.use('/api/table', tableRouter)
app.use('/api/waiter', waiterRouter)
app.use('/api/deal', dealRoute)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/role', RoleRouter)

// 404 Route
app.use(notFound)

// error Handler
app.use(errorHandler)

export default app
