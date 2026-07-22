'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Departamento extends Model {
    static associate(models) {
      Departamento.hasMany(models.Certificacion, { foreignKey: 'departamentoId', as: 'certificaciones' });
    }
  }

  Departamento.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ubicacion: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: 'Departamento',
      tableName: 'departamentos',
      underscored: true,
    }
  );

  return Departamento;
};
