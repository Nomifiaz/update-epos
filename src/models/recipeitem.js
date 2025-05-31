
import {DataTypes} from 'sequelize';
import {sequelize} from '../config/db.js';

  const RecipeItem = sequelize.define('RecipeItem', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    recipeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    inventoryItemId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    unitCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    totalCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    tableName: 'RecipeItems'
  });

  RecipeItem.associate = (models) => {
    RecipeItem.belongsTo(models.Recipe, {
      foreignKey: 'recipeId',
      as: 'recipe'
    });

    RecipeItem.belongsTo(models.InventoryItem, {
      foreignKey: 'inventoryItemId',
      as: 'inventoryItem'
    });
  };

export default RecipeItem