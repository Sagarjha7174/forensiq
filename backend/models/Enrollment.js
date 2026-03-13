const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Enrollment = sequelize.define(
  'Enrollment',
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
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    },
    payment_status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'paid'
    }
  },
  {
    tableName: 'enrollments',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'course_id']
      }
    ]
  }
);

module.exports = Enrollment;
