import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Role from './role.js';

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
        roleId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        addedBy: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    { timestamps: true },
);
User.belongsTo(Role, {
  foreignKey: 'roleId',
});

export default User;
