const {
  Op,
  ForeignKeyConstraintError,
  UniqueConstraintError,
} = require("sequelize");
const { Nave } = require("../models");

async function getAll(req, res) {
  try {
    const { estado, departamentoId, busqueda } = req.query;
    const where = {};

    if (estado) {
      where.estado = estado;
    }

    if (departamentoId) {
      where.departamentoId = departamentoId;
    }

    if (busqueda) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${busqueda}%` } },
        { numeroMatricula: { [Op.like]: `%${busqueda}%` } },
      ];
    }

    const naves = await Nave.findAll({
      where,
      include: [{ association: "departamento", attributes: ["id", "nombre"] }],
    });
    res.json(naves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las naves" });
  }
}

async function getById(req, res) {
  try {
    const nave = await Nave.findByPk(req.params.id, {
      include: [{ association: "departamento", attributes: ["id", "nombre"] }],
    });

    if (!nave) {
      return res.status(404).json({
        message: `No se encontró una nave con id ${req.params.id}`,
      });
    }

    res.json(nave);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la nave" });
  }
}

async function create(req, res) {
  try {
    const { nombre, numeroMatricula, tipo, eslora, departamentoId, estado } = req.body;

    if (!nombre || !numeroMatricula || !departamentoId) {
      return res.status(400).json({
        message: "nombre, numeroMatricula y departamentoId son obligatorios",
      });
    }

    const nave = await Nave.create({
      nombre,
      numeroMatricula,
      tipo,
      eslora,
      departamentoId,
      estado,
    });
    res.status(201).json(nave);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res
        .status(409)
        .json({ message: "Ya existe una nave con ese número de matrícula" });
    }

    console.error(error);
    res.status(500).json({ message: "Error al crear la nave" });
  }
}

async function update(req, res) {
  try {
    const nave = await Nave.findByPk(req.params.id);

    if (!nave) {
      return res.status(404).json({
        message: `No se encontró una nave con id ${req.params.id}`,
      });
    }

    const { nombre, numeroMatricula, tipo, eslora, departamentoId, estado } = req.body;
    const camposPermitidos = {
      nombre,
      numeroMatricula,
      tipo,
      eslora,
      departamentoId,
      estado,
    };
    Object.keys(camposPermitidos).forEach((key) => {
      if (camposPermitidos[key] === undefined) {
        delete camposPermitidos[key];
      }
    });

    await nave.update(camposPermitidos);
    res.json(nave);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res
        .status(409)
        .json({ message: "Ya existe una nave con ese número de matrícula" });
    }

    console.error(error);
    res.status(500).json({ message: "Error al actualizar la nave" });
  }
}

async function remove(req, res) {
  try {
    const nave = await Nave.findByPk(req.params.id);

    if (!nave) {
      return res.status(404).json({
        message: `No se encontró una nave con id ${req.params.id}`,
      });
    }

    await nave.destroy();
    res.status(200).json({ message: "Nave eliminada correctamente" });
  } catch (error) {
    if (error instanceof ForeignKeyConstraintError) {
      return res.status(409).json({
        message: "No se puede eliminar la nave porque tiene certificaciones asociadas",
      });
    }

    console.error(error);
    res.status(500).json({ message: "Error al eliminar la nave" });
  }
}

module.exports = { getAll, getById, create, update, remove };
