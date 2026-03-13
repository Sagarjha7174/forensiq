const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const QuizQuestion = sequelize.define(
  'QuizQuestion',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    quiz_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    options_json: {
      type: DataTypes.JSON,
      allowNull: false
    },
    correct_option: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: 'quiz_questions'
  }
);

module.exports = QuizQuestion;
