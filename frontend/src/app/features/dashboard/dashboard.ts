import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { Empleado, EmpleadoService } from '../../core/empleado.service';
import { PageTitleService } from '../../core/page-title.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly empleadoService = inject(EmpleadoService);
  private readonly authService = inject(AuthService);
  private readonly pageTitleService = inject(PageTitleService);

  protected readonly usuario = this.authService.obtenerUsuario();

  protected readonly empleados = signal<Empleado[]>([]);
  protected readonly cargandoEmpleados = signal(true);
  protected readonly errorEmpleados = signal<string | null>(null);

  protected readonly empleadosActivos = computed(
    () => this.empleados().filter((empleado) => empleado.estado === 'activo').length
  );
  protected readonly empleadosTotal = computed(() => this.empleados().length);

  // TODO: reemplazar por datos reales cuando exista el CRUD de Certificacion
  // en el backend (GET /api/certificaciones con filtro por estado/vencimiento).
  protected readonly certificacionesPorVencer = 1;
  protected readonly certificacionesVencidas = 2;

  constructor() {
    this.pageTitleService.title.set('Dashboard');

    this.empleadoService.getAll().subscribe({
      next: (empleados) => {
        this.empleados.set(empleados);
        this.cargandoEmpleados.set(false);
      },
      error: () => {
        this.errorEmpleados.set('No se pudo cargar el resumen de empleados.');
        this.cargandoEmpleados.set(false);
      },
    });
  }
}
