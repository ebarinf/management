'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('certificaciones', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      empleado_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'empleados',
          key: 'id',
        },
        onDelete: 'NO ACTION',
      },
      departamento_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'departamentos',
          key: 'id',
        },
        onDelete: 'NO ACTION',
      },
      tipo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      numero: {
        type: Sequelize.STRING,
      },
      fecha_emision: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      fecha_vencimiento: {
        type: Sequelize.DATEONLY,
      },
      estado: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'vigente',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('certificaciones');
  },
};
