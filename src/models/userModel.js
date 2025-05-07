import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const User = sequelize.define(
    'User',
    {
        userName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            },
        },
        role: {
            type: DataTypes.ENUM('admin', 'superAdmin', 'cashier'),
            defaultValue: 'admin',
            validate: {
                isIn: [['admin', 'superAdmin', 'cashier']],
            },
        },
        addedBy: {
            type: DataTypes.INTEGER, 
            allowNull: true, 
        },
    },
    { timestamps: true },
);

export default User;
