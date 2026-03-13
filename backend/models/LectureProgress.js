const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const LectureProgress = sequelize.define(
  'LectureProgress',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    resource_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    tableName: 'lecture_progress',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'resource_id']
      }
    ]
  }
);

module.exports = LectureProgress;
