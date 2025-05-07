import {DataTypes} from 'sequelize';
import {sequelize} from '../config/db.js';
import User from './userModel.js';

const Menu = sequelize.define(
    'Menu',
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        menuTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'MenuTypes',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        image: {
            type: DataTypes.STRING,
            defaultValue: '',
            allowNull: false,
        },
        createdBy: {
            type: DataTypes.INTEGER, // Admin ID who created the menu type
            allowNull: false,
            references: {
                model: User,
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
    },
    {timestamps: true},
);





export default Menu;
