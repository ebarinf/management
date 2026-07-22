'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Certificacion extends Model {
    static associate(models) {
      Certificacion.belongsTo(models.Empleado, { foreignKey: 'empleadoId', as: 'empleado' });
      Certificacion.belongsTo(models.Departamento, { foreignKey: 'departamentoId', as: 'departamento' });
    }
  }

  Certificacion.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      empleadoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      departamentoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tipo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      numero: {
        type: DataTypes.STRING,
      },
      fechaEmision: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      fechaVencimiento: {
        type: DataTypes.DATEONLY,
      },
      estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'vigente',
      },
    },
    {
      sequelize,
      modelName: 'Certificacion',
      tableName: 'certificaciones',
      underscored: true,
    }
  );

  return Certificacion;
};
