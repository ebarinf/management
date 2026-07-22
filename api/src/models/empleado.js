'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Empleado extends Model {
    static associate(models) {
      Empleado.hasMany(models.Certificacion, { foreignKey: 'empleadoId', as: 'certificaciones' });
      Empleado.hasOne(models.Usuario, { foreignKey: 'empleadoId', as: 'usuario' });
    }
  }

  Empleado.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      rut: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      nombres: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      apellidos: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
      },
      estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'activo',
      },
    },
    {
      sequelize,
      modelName: 'Empleado',
      tableName: 'empleados',
      underscored: true,
    }
  );

  return Empleado;
};
