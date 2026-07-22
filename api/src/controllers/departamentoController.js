const {
  Op,
  ForeignKeyConstraintError,
  UniqueConstraintError,
} = require("sequelize");
const { Departamento } = require("../models");

async function getAll(req, res) {
  try {
    const { nombre, ubicacion } = req.query;
    const where = {};

    if (nombre || ubicacion) {
      where[Op.or] = [
        nombre ? { nombre: { [Op.like]: `%${nombre}%` } } : null,
        ubicacion ? { ubicacion: { [Op.like]: `%${ubicacion}%` } } : null,
      ].filter(Boolean);
    }

    const departamentos = await Departamento.findAll({ where });
    res.json(departamentos);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener los departamentos" });
  }
}

async function getById(req, res) {
  try {
    const departamento = await Departamento.findByPk(req.params.id);

    if (!departamento) {
      return res.status(404).json({
        message: `No se encontró un departamento con id ${req.params.id}`,
      });
    }

    res.json(departamento);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el departamento" });
  }
}

async function create(req, res) {
  try {
    const { nombre, ubicacion } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: "nombre es obligatorio" });
    }

    const departamento = await Departamento.create({ nombre, ubicacion });
    res.status(201).json(departamento);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al crear el departamento" });
  }
}

async function update(req, res) {
  try {
    const departamento = await Departamento.findByPk(req.params.id);

    if (!departamento) {
      return res.status(404).json({
        message: `No se encontró un departamento con id ${req.params.id}`,
      });
    }

    const { nombre, ubicacion } = req.body;
    const camposPermitidos = { nombre, ubicacion };
    Object.keys(camposPermitidos).forEach((key) => {
      if (camposPermitidos[key] === undefined) {
        delete camposPermitidos[key];
      }
    });

    await departamento.update(camposPermitidos);
    res.json(departamento);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el departamento" });
  }
}

async function remove(req, res) {
  try {
    const departamento = await Departamento.findByPk(req.params.id);

    if (!departamento) {
      return res.status(404).json({
        message: `No se encontró un departamento con id ${req.params.id}`,
      });
    }

    await departamento.destroy();
    res.status(200).json({ message: "Departamento eliminado correctamente" });
  } catch (error) {
    if (error instanceof ForeignKeyConstraintError) {
      return res.status(409).json({
        message:
          "No se puede eliminar el departamento porque tiene certificaciones asociadas",
      });
    }

    console.log(error);
    res.status(500).json({ message: "Error al eliminar departamento" });
  }
}

module.exports = { getAll, getById, create, update, remove };
