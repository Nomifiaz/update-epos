import Deal from './dealModel.js'
import MenuItem from './menuItemModel.js'
import Menu from './menuModel.js'
import MenuType from './menuTypeModel.js'
import Recipe from './recipeModel.js'
import RecipeType from './recipeTypeModel.js'
import User from './userModel.js'
import orderLogs from './orderLogs.js'

Menu.hasMany(MenuItem, { foreignKey: 'menuId' })
MenuItem.belongsTo(Menu, { foreignKey: 'menuId' })

Recipe.hasMany(MenuItem, { foreignKey: 'recipeId' })
MenuItem.belongsTo(Recipe, { foreignKey: 'recipeId' })

MenuType.hasMany(Menu, { foreignKey: 'menuTypeId' })
Menu.belongsTo(MenuType, { foreignKey: 'menuTypeId' })

RecipeType.hasMany(Recipe, { foreignKey: 'recipeTypeId' })
Recipe.belongsTo(RecipeType, { foreignKey: 'recipeTypeId' })

MenuItem.belongsToMany(Deal, { through: 'DealMenuItem' })
Deal.belongsToMany(MenuItem, { through: 'DealMenuItem' })
//.....................
User.hasMany(Menu, { foreignKey: 'createdBy', onDelete: 'CASCADE' })
Menu.belongsTo(User, { foreignKey: 'createdBy' })
//..........recipe type
User.hasMany(RecipeType, { foreignKey: 'createdBy', onDelete: 'CASCADE' })
RecipeType.belongsTo(User, { foreignKey: 'createdBy' })
//..........recipe

User.hasMany(Recipe, { foreignKey: 'createdBy', onDelete: 'CASCADE' })
Recipe.belongsTo(User, { foreignKey: 'createdBy' })

//deal
User.hasMany(Deal, { foreignKey: 'createdBy', onDelete: 'CASCADE' })
Deal.belongsTo(User, { foreignKey: 'createdBy' })

orderLogs.belongsTo(User, { foreignKey: 'userId' })

export { Deal, MenuItem, Menu, MenuType, Recipe, RecipeType }
