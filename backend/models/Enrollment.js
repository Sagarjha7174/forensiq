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
      type: DataTypes.ENUM('paid', 'pending', 'free', 'failed'),
      allowNull: false,
      defaultValue: 'paid'
    },
    razorpay_order_id: { type: DataTypes.STRING, allowNull: true },
    razorpay_payment_id: { type: DataTypes.STRING, allowNull: true }
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
