const { Op, ValidationError } = require("sequelize");
const { Certificacion } = require("../models");

// El listado y el detalle necesitan mostrar el nombre del empleado/nave/
// departamento, no solo el id — se traen vía include en vez de que el
// frontend tenga que resolverlos aparte.
const includeAsociaciones = [
  { association: "empleado", attributes: ["id", "nombres", "apellidos"] },
  { association: "nave", attributes: ["id", "nombre", "numeroMatricula"] },
  { association: "departamento", attributes: ["id", "nombre"] },
];

async function getAll(req, res) {
  try {
    const { estado, busqueda } = req.query;
    const where = {};
    if (estado) {
      where.estado = estado;
    }

    if (busqueda) {
      where[Op.or] = [
        { tipo: { [Op.like]: `%${busqueda}%` } },
        { numero: { [Op.like]: `%${busqueda}%` } },
        { "$empleado.nombres$": { [Op.like]: `%${busqueda}%` } },
        { "$empleado.apellidos$": { [Op.like]: `%${busqueda}%` } },
      ];
    }

    const certificaciones = await Certificacion.findAll({
      where,
      include: includeAsociaciones,
    });
    res.json(certificaciones);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener las certificaciones" });
  }
}

async function getById(req, res) {
  try {
    const certificacion = await Certificacion.findByPk(req.params.id, {
      include: includeAsociaciones,
    });

    if (!certificacion) {
      return res
        .status(404)
        .json({ message: "No se encontró la certificación" });
    }

    res.json(certificacion);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener certificación" });
  }
}

async function create(req, res) {
  try {
    const {
      empleadoId,
      naveId,
      departamentoId,
      tipo,
      numero,
      fechaEmision,
      fechaVencimiento,
      estado,
    } = req.body;

    if (!departamentoId || !tipo || !fechaEmision) {
      return res.status(400).json({
        message: "Departamento, tipo y fecha de emisión son obligatorios",
      });
    }

    const certificacion = await Certificacion.create({
      empleadoId,
      naveId,
      departamentoId,
      tipo,
      numero,
      fechaEmision,
      fechaVencimiento,
      estado,
    });
    res.status(201).json(certificacion);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.errors[0].message });
    }

    console.error(error);
    res.status(500).json({ message: "Error al crear el certificacion" });
  }
}

async function update(req, res) {
  try {
    const certificacion = await Certificacion.findByPk(req.params.id);

    if (!certificacion) {
      return res.status(404).json({
        message: `No se encontró una certificación con id ${req.params.id}`,
      });
    }

    const {
      empleadoId,
      naveId,
      departamentoId,
      tipo,
      numero,
      fechaEmision,
      fechaVencimiento,
      estado,
    } = req.body;
    const camposPermitidos = {
      empleadoId,
      naveId,
      departamentoId,
      tipo,
      numero,
      fechaEmision,
      fechaVencimiento,
      estado,
    };
    Object.keys(camposPermitidos).forEach((key) => {
      if (camposPermitidos[key] === undefined) {
        delete camposPermitidos[key];
      }
    });

    await certificacion.update(camposPermitidos);
    res.json(certificacion);
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.errors[0].message });
    }

    console.error(error);
    res.status(500).json({ message: "Error al actualizar la certificación" });
  }
}

async function remove(req, res) {
  try {
    const certificacion = await Certificacion.findByPk(req.params.id);

    if (!certificacion) {
      return res.status(404).json({
        message: `No se encontró una certificación con id ${req.params.id}`,
      });
    }

    await certificacion.destroy();
    res.status(200).json({ message: "Certificación eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la certificación" });
  }
}

module.exports = { getAll, getById, create, update, remove };
