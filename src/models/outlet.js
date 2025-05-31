// models/Outlet.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import User from "./userModel.js";

const Outlet = sequelize.define("Outlet", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    linkiedIp: {  
        type: DataTypes.STRING,
        allowNull: true,
    },
     managerId: {  
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    createdby: {  
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: true,
    tableName: "outlet",
});
// Outlet.js
Outlet.belongsTo(User, { foreignKey: 'managerId' });
// User.js
User.hasOne(Outlet, { foreignKey: 'managerId' });

export default Outlet;