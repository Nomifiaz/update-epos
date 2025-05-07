// models/TransferStock.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const TransferStock = sequelize.define("TransferStock", {
    creditDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    outletId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    sectionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    remarks: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    inventoryItemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    purchaseRate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    totalPurchase: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    }
}, {
    timestamps: true,
    tableName: "transferStock",
});

export default TransferStock;