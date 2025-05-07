import {DataTypes} from 'sequelize';
import {sequelize} from '../config/db.js';
import User from './userModel.js';

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
            allowNull: false,
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
    },
    {timestamps: true},
);



export default Recipe;
