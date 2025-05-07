import {DataTypes} from 'sequelize';
import {sequelize} from '../config/db.js';
import User from './userModel.js';

const Deal = sequelize.define(
    'Deal',
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        menuId: {
            type: DataTypes.JSON, // Storing as an array
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        status: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
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
        image: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '',
        },
    },
    {timestamps: true},
);

export default Deal;
