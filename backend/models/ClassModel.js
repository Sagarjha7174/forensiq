const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ClassModel = sequelize.define(
  'ClassModel',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  },
  {
    tableName: 'classes'
  }
);

module.exports = ClassModel;
