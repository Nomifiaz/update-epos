// models/TransferStock.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const stockReturnToSupplier = sequelize.define("stockReturnToSupplier", {
    returnDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    SupplierId: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
    totalReturn: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    }
}, {
    timestamps: true,
    tableName: "stockReturnToSupplier",
});

export default stockReturnToSupplier;