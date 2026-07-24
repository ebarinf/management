"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("naves", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      numero_matricula: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      tipo: {
        type: Sequelize.STRING,
      },
      eslora: {
        type: Sequelize.FLOAT,
      },
      departamento_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "departamentos",
          key: "id",
        },
        onDelete: "NO ACTION",
      },
      estado: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "activa",
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("naves");
  },
};
