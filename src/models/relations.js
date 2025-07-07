import Deal from './dealModel.js'
import MenuItem from './menuItemModel.js'
import Menu from './menuModel.js'
import MenuType from './menuTypeModel.js'
import Recipe from './recipeModel.js'
import RecipeType from './recipeTypeModel.js'
import User from './userModel.js'
import orderLogs from './orderLogs.js'
import DealItem from './dealItems.js'
import MenuItemVariation from './menuItemVariation.js'

Menu.hasMany(MenuItem, { foreignKey: 'menuId' })
MenuItem.belongsTo(Menu, { foreignKey: 'menuId' })

Recipe.hasMany(MenuItem, { foreignKey: 'recipeId' })
MenuItem.belongsTo(Recipe, { foreignKey: 'recipeId' })

MenuType.hasMany(Menu, { foreignKey: 'menuTypeId' })
Menu.belongsTo(MenuType, { foreignKey: 'menuTypeId' })

RecipeType.hasMany(Recipe, { foreignKey: 'recipeTypeId' })
Recipe.belongsTo(RecipeType, { foreignKey: 'recipeTypeId' })


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
// 🔗 Set associations
Deal.hasMany(DealItem, { foreignKey: 'dealId', onDelete: 'CASCADE' });
DealItem.belongsTo(Deal, { foreignKey: 'dealId' });

Menu.hasMany(DealItem, { foreignKey: 'menuId', onDelete: 'CASCADE' });
DealItem.belongsTo(Menu, { foreignKey: 'menuId' });

MenuItemVariation.hasMany(DealItem, { foreignKey: 'menuItemVariationId', onDelete: 'CASCADE' });
DealItem.belongsTo(MenuItemVariation, { foreignKey: 'menuItemVariationId' });

MenuItem.hasMany(MenuItemVariation, { foreignKey: 'menuItemId', onDelete: 'CASCADE' });
MenuItemVariation.belongsTo(MenuItem, { foreignKey: 'menuItemId' });


orderLogs.belongsTo(User, { foreignKey: 'userId' })

export {  MenuItem, Menu, MenuType, Recipe, RecipeType,MenuItemVariation,Deal,DealItem}
