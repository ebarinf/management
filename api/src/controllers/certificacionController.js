const {
  Op,
  ForeignKeyConstraintError,
  UniqueConstraintError,
} = require("sequelize");
const { Certificacion } = require("../models");

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
      ];
    }

    const certificaciones = await Certificacion.findAll({ where });
    res.json(certificaciones);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error al obtener las certificaciones" });
  }
}

async function getById(req, res) {
  try {
    const certificacion = await Certificacion.findByPk(req.params.id);

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
      empleado,
      departamento,
      tipo,
      numero,
      fechaEmision,
      fechaVencimiento,
      estado,
    } = req.body;

    if (!empleado || !departamento || !tipo || !fechaEmision || !estado) {
      return res
        .status(400)
        .json({
          message:
            "Empleado, departamento, tipo, Fecha de emisión y estado son obligatorios",
        });
    }
  } catch {}
}
