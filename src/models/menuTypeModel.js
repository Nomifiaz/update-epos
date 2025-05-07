import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import User from './userModel.js';

const MenuType = sequelize.define(
    'MenuType',
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
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
    { timestamps: true },
);

User.hasMany(MenuType, { foreignKey: 'createdBy', onDelete: 'CASCADE' });
MenuType.belongsTo(User, { foreignKey: 'createdBy' });

export default MenuType;
