const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CourseClass = sequelize.define(
  'CourseClass',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    course_id: { type: DataTypes.INTEGER, allowNull: false },
    class_id: { type: DataTypes.INTEGER, allowNull: false }
  },
  { tableName: 'course_classes', timestamps: false }
);

module.exports = CourseClass;
