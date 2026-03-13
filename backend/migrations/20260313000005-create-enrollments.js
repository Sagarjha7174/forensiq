'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('enrollments', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'courses', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      payment_status: {
        type: Sequelize.ENUM('paid', 'pending', 'free', 'failed'),
        allowNull: false,
        defaultValue: 'paid'
      },
      razorpay_order_id: { type: Sequelize.STRING, allowNull: true },
      razorpay_payment_id: { type: Sequelize.STRING, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });
    await queryInterface.addIndex('enrollments', ['user_id', 'course_id'], { unique: true });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('enrollments');
  }
};
