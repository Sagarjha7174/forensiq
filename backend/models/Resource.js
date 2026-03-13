const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Resource = sequelize.define(
  'Resource',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('lecture', 'pdf', 'quiz', 'announcement'),
      allowNull: false
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    order_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    content_url: {
      type: DataTypes.STRING,
      allowNull: true
    }
  },
  {
    tableName: 'resources'
  }
);

module.exports = Resource;
