"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Nave extends Model {
    static associate(models) {
      Nave.belongsTo(models.Departamento, {
        foreignKey: "departamentoId",
        as: "departamento",
      });
      Nave.hasMany(models.Certificacion, {
        foreignKey: "naveId",
        as: "certificaciones",
      });
    }
  }

  Nave.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      numeroMatricula: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      tipo: {
        type: DataTypes.STRING,
      },
      eslora: {
        type: DataTypes.FLOAT,
      },
      departamentoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      estado: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "activa",
      },
    },
    {
      sequelize,
      modelName: "Nave",
      tableName: "naves",
      underscored: true,
    },
  );

  return Nave;
};
