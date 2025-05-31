import {DataTypes} from 'sequelize';
import {sequelize} from '../config/db.js';
import User from './userModel.js';
import Sections from './sections.js';

const RecipeType = sequelize.define(
    'RecipeType',
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        sectionId:{
            type:DataTypes.INTEGER,
            allowNull:false,
            references:{
                model:Sections,
                key:"id"
            }
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




    },
    {timestamps: true},
);




export default RecipeType;
