const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Quiz = sequelize.define(
  'Quiz',
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
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    timer_minutes: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30
    }
  },
  {
    tableName: 'quizzes'
  }
);

module.exports = Quiz;
