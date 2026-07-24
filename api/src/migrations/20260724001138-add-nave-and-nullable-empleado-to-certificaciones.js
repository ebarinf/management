"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("certificaciones", "nave_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "naves",
        key: "id",
      },
      onDelete: "NO ACTION",
    });

    // queryInterface.changeColumn no aplica realmente el cambio de
    // nullability en el dialecto mssql cuando la columna ya tiene una FK
    // (corre sin error, pero la columna queda igual) — se usa SQL directo
    // en su lugar, verificado contra la base real.
    await queryInterface.sequelize.query(
      "ALTER TABLE certificaciones ALTER COLUMN empleado_id INT NULL"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      "ALTER TABLE certificaciones ALTER COLUMN empleado_id INT NOT NULL"
    );

    await queryInterface.removeColumn("certificaciones", "nave_id");
  },
};
