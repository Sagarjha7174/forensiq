'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lecture_progress', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      resource_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'resources', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      completed: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });
    await queryInterface.addIndex('lecture_progress', ['user_id', 'resource_id'], { unique: true });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('lecture_progress');
  }
};
