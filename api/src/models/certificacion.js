'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Certificacion extends Model {
    static associate(models) {
      Certificacion.belongsTo(models.Empleado, { foreignKey: 'empleadoId', as: 'empleado' });
      Certificacion.belongsTo(models.Departamento, { foreignKey: 'departamentoId', as: 'departamento' });
      Certificacion.belongsTo(models.Nave, { foreignKey: 'naveId', as: 'nave' });
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
        allowNull: true,
      },
      naveId: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
      validate: {
        exactamenteUnoDeEmpleadoONave() {
          const tieneEmpleado = this.empleadoId !== null && this.empleadoId !== undefined;
          const tieneNave = this.naveId !== null && this.naveId !== undefined;
          if (tieneEmpleado === tieneNave) {
            throw new Error(
              'La certificación debe aplicar a exactamente un empleado o una nave, no a ambos ni a ninguno.'
            );
          }
        },
      },
    }
  );

  return Certificacion;
};
