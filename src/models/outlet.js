// models/Outlet.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Outlet = sequelize.define("Outlet", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    linkedIp: {  // Fixed typo from linkiedIp
        type: DataTypes.STRING,
        allowNull: true,
    },
    createdBy: {  // Consistent casing (createdBy instead of createdby)
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: true,
    tableName: "outlet",
});

export default Outlet;