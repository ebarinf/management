'use strict';

const bcrypt = require('bcryptjs');

const escape = (value) => (value === null ? 'NULL' : `'${String(value).replace(/'/g, "''")}'`);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const nowSql = "GETDATE()";

    const departamentos = [
      { id: 1, nombre: 'Recursos Humanos', ubicacion: 'Edificio A, Piso 2' },
      { id: 2, nombre: 'Operaciones', ubicacion: 'Edificio B, Piso 1' },
    ];
    const departamentosSql = departamentos
      .map((d) => `(${d.id}, ${escape(d.nombre)}, ${escape(d.ubicacion)}, ${nowSql}, ${nowSql})`)
      .join(', ');

    await queryInterface.sequelize.query(`
      SET IDENTITY_INSERT departamentos ON;
      INSERT INTO departamentos (id, nombre, ubicacion, created_at, updated_at) VALUES ${departamentosSql};
      SET IDENTITY_INSERT departamentos OFF;
    `);

    const empleados = [
      { id: 1, rut: '11111111-1', nombres: 'Juan', apellidos: 'Pérez González', email: 'juan.perez@empresa.cl' },
      { id: 2, rut: '22222222-2', nombres: 'María', apellidos: 'Rodríguez Soto', email: 'maria.rodriguez@empresa.cl' },
      { id: 3, rut: '33333333-3', nombres: 'Pedro', apellidos: 'Sánchez Muñoz', email: 'pedro.sanchez@empresa.cl' },
      { id: 4, rut: '44444444-4', nombres: 'Ana', apellidos: 'Torres Vidal', email: 'ana.torres@empresa.cl' },
    ];
    const empleadosSql = empleados
      .map(
        (e) =>
          `(${e.id}, ${escape(e.rut)}, ${escape(e.nombres)}, ${escape(e.apellidos)}, ${escape(e.email)}, 'activo', ${nowSql}, ${nowSql})`
      )
      .join(', ');

    await queryInterface.sequelize.query(`
      SET IDENTITY_INSERT empleados ON;
      INSERT INTO empleados (id, rut, nombres, apellidos, email, estado, created_at, updated_at) VALUES ${empleadosSql};
      SET IDENTITY_INSERT empleados OFF;
    `);

    await queryInterface.bulkInsert('certificaciones', [
      {
        empleado_id: 1,
        departamento_id: 1,
        tipo: 'Curso de Prevención de Riesgos',
        numero: 'CPR-2023-045',
        fecha_emision: '2023-01-10',
        fecha_vencimiento: '2024-01-10',
        estado: 'vencida',
        created_at: now,
        updated_at: now,
      },
      {
        empleado_id: 2,
        departamento_id: 2,
        tipo: 'Certificación ISO 9001',
        numero: 'ISO-2025-012',
        fecha_emision: '2025-06-01',
        fecha_vencimiento: '2027-06-01',
        estado: 'vigente',
        created_at: now,
        updated_at: now,
      },
      {
        empleado_id: 3,
        departamento_id: 2,
        tipo: 'Manejo de Materiales Peligrosos',
        numero: 'MMP-2024-078',
        fecha_emision: '2024-03-15',
        fecha_vencimiento: '2026-12-31',
        estado: 'vigente',
        created_at: now,
        updated_at: now,
      },
      {
        empleado_id: 4,
        departamento_id: 1,
        tipo: 'Primeros Auxilios',
        numero: 'PA-2025-003',
        fecha_emision: '2025-01-20',
        fecha_vencimiento: '2028-01-20',
        estado: 'vigente',
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert('usuarios', [
      {
        username: 'admin',
        password_hash: bcrypt.hashSync('admin123', 10),
        rol: 'admin',
        empleado_id: null,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('usuarios', null, {});
    await queryInterface.bulkDelete('certificaciones', null, {});
    await queryInterface.bulkDelete('empleados', null, {});
    await queryInterface.bulkDelete('departamentos', null, {});
  },
};
