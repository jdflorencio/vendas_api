'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('grupo', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        allowNull: false,
        references: {
          model: 'user',
          key: 'id'
        },
        type: Sequelize.INTEGER,
      },
      descricao: {
        type: Sequelize.STRING(30)
      },
      log_criacao: {
        allowNull: false,
        type: Sequelize.DATE
      },
      log_atualizacao: {
        allowNull: false,
        type: Sequelize.DATE
      },
      log_pct_usuario: {
        allowNull: true,
        type: Sequelize.INTEGER
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('grupo')
  }
};