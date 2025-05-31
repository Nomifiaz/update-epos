import {DataTypes} from 'sequelize';
import {sequelize} from '../config/db.js';
import User from './userModel.js';
import InventoryItem from './inventoryItem.js';
import RecipeItem from './recipeitem.js';

const Recipe = sequelize.define(
    'Recipe',
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        description: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue:"best"
        },
        createdBy: {
            type: DataTypes.INTEGER, // Admin ID who created the menu type
            allowNull: false,
            references: {
              model: User,
              key: "id",
            },
            onDelete: "CASCADE",
          },



        recipeTypeId: {
            type: DataTypes.INTEGER,
            references: {
                model: 'RecipeTypes',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
     
     
        cost: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                notEmpty: true,
                isDecimal: true,
            },
        },
    },
    {timestamps: true},
);

// Recipe.hasMany(RecipeItem,{references:'recipeid'})
// //
// InventoryItem.

export default Recipe;
