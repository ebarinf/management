import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { Empleado, EmpleadoService } from '../../core/empleado.service';
import { Nave, NaveService } from '../../core/nave.service';
import { Certificacion, CertificacionService } from '../../core/certificacion.service';
import { PageTitleService } from '../../core/page-title.service';

const DIAS_PROXIMO_VENCIMIENTO = 30;

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly empleadoService = inject(EmpleadoService);
  private readonly naveService = inject(NaveService);
  private readonly certificacionService = inject(CertificacionService);
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

  protected readonly naves = signal<Nave[]>([]);
  protected readonly cargandoNaves = signal(true);
  protected readonly errorNaves = signal<string | null>(null);

  protected readonly navesActivas = computed(
    () => this.naves().filter((nave) => nave.estado === 'activa').length
  );
  protected readonly navesTotal = computed(() => this.naves().length);

  protected readonly certificaciones = signal<Certificacion[]>([]);
  protected readonly cargandoCertificaciones = signal(true);
  protected readonly errorCertificaciones = signal<string | null>(null);

  protected readonly certificacionesTotal = computed(() => this.certificaciones().length);
  protected readonly certificacionesVencidas = computed(
    () => this.certificaciones().filter((certificacion) => certificacion.estado === 'vencida').length
  );
  protected readonly certificacionesPorVencer = computed(() => {
    const hoy = new Date();
    const limite = new Date();
    limite.setDate(hoy.getDate() + DIAS_PROXIMO_VENCIMIENTO);

    return this.certificaciones().filter((certificacion) => {
      if (certificacion.estado !== 'vigente' || !certificacion.fechaVencimiento) {
        return false;
      }
      const vencimiento = new Date(certificacion.fechaVencimiento);
      return vencimiento >= hoy && vencimiento <= limite;
    }).length;
  });

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

    this.naveService.getAll().subscribe({
      next: (naves) => {
        this.naves.set(naves);
        this.cargandoNaves.set(false);
      },
      error: () => {
        this.errorNaves.set('No se pudo cargar el resumen de naves.');
        this.cargandoNaves.set(false);
      },
    });

    this.certificacionService.getAll().subscribe({
      next: (certificaciones) => {
        this.certificaciones.set(certificaciones);
        this.cargandoCertificaciones.set(false);
      },
      error: () => {
        this.errorCertificaciones.set('No se pudo cargar el resumen de certificaciones.');
        this.cargandoCertificaciones.set(false);
      },
    });
  }
}
