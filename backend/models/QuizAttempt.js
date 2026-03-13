const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const QuizAttempt = sequelize.define(
  'QuizAttempt',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    quiz_id: { type: DataTypes.INTEGER, allowNull: false },
    score: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    total_questions: { type: DataTypes.INTEGER, allowNull: false },
    answers_json: { type: DataTypes.JSON, allowNull: false }
  },
  { tableName: 'quiz_attempts' }
);

module.exports = QuizAttempt;
