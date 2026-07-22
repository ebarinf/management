const {
  Op,
  ForeignKeyConstraintError,
  UniqueConstraintError,
} = require("sequelize");
const { Empleado } = require("../models");

async function getAll(req, res) {
  try {
    const { estado, busqueda } = req.query;
    const where = {};

    if (estado) {
      where.estado = estado;
    }

    if (busqueda) {
      where[Op.or] = [
        { rut: { [Op.like]: `%${busqueda}%` } },
        { nombres: { [Op.like]: `%${busqueda}%` } },
        { apellidos: { [Op.like]: `%${busqueda}%` } },
      ];
    }

    const empleados = await Empleado.findAll({ where });
    res.json(empleados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los empleados" });
  }
}

async function getById(req, res) {
  try {
    const empleado = await Empleado.findByPk(req.params.id);

    if (!empleado) {
      return res.status(404).json({
        message: `No se encontró un empleado con id ${req.params.id}`,
      });
    }

    res.json(empleado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el empleado" });
  }
}

async function create(req, res) {
  try {
    const { rut, nombres, apellidos, email, estado } = req.body;

    if (!rut || !nombres || !apellidos || !email) {
      return res
        .status(400)
        .json({ message: "rut, nombres, apellidos y email son obligatorios" });
    }

    const empleado = await Empleado.create({
      rut,
      nombres,
      apellidos,
      email,
      estado,
    });
    res.status(201).json(empleado);
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      // SQL Server no expone el nombre de columna real en el constraint
      // (a diferencia de Postgres), así que inferimos el campo comparando
      // el valor duplicado que reporta el driver contra lo enviado.
      const valorDuplicado = error.errors?.[0]?.value;
      let campo = error.errors?.[0]?.path;
      if (campo !== "rut" && campo !== "email") {
        if (valorDuplicado === req.body.rut) campo = "rut";
        else if (valorDuplicado === req.body.email) campo = "email";
      }
      const mensaje =
        campo === "email"
          ? "Ya existe un empleado con ese email"
          : campo === "rut"
            ? "Ya existe un empleado con ese RUT"
            : "Ya existe un empleado con ese RUT o email";
      return res.status(409).json({ message: mensaje });
    }

    console.error(error);
    res.status(500).json({ message: "Error al crear el empleado" });
  }
}

async function update(req, res) {
  try {
    const empleado = await Empleado.findByPk(req.params.id);

    if (!empleado) {
      return res.status(404).json({
        message: `No se encontró un empleado con id ${req.params.id}`,
      });
    }

    const { rut, nombres, apellidos, email, estado } = req.body;
    const camposPermitidos = { rut, nombres, apellidos, email, estado };
    Object.keys(camposPermitidos).forEach((key) => {
      if (camposPermitidos[key] === undefined) {
        delete camposPermitidos[key];
      }
    });

    await empleado.update(camposPermitidos);
    res.json(empleado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el empleado" });
  }
}

async function remove(req, res) {
  try {
    const empleado = await Empleado.findByPk(req.params.id);

    if (!empleado) {
      return res.status(404).json({
        message: `No se encontró un empleado con id ${req.params.id}`,
      });
    }

    await empleado.destroy();
    res.status(200).json({ message: "Empleado eliminado correctamente" });
  } catch (error) {
    if (error instanceof ForeignKeyConstraintError) {
      return res.status(409).json({
        message:
          "No se puede eliminar el empleado porque tiene certificaciones asociadas",
      });
    }

    console.error(error);
    res.status(500).json({ message: "Error al eliminar el empleado" });
  }
}

module.exports = { getAll, getById, create, update, remove };
