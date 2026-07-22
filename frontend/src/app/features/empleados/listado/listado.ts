import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { Observable, combineLatest, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, startWith, switchMap } from 'rxjs/operators';

import { Empleado, EmpleadoService } from '../../../core/empleado.service';
import { PageTitleService } from '../../../core/page-title.service';
import { EmpleadoFormDialog } from '../empleado-form-dialog/empleado-form-dialog';

@Component({
  selector: 'app-empleados-listado',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './listado.html',
  styleUrl: './listado.scss',
})
export class Listado {
  private readonly fb = inject(FormBuilder);
  private readonly empleadoService = inject(EmpleadoService);
  private readonly pageTitleService = inject(PageTitleService);
  private readonly dialog = inject(MatDialog);

  protected readonly columnas = ['rut', 'nombres', 'apellidos', 'email', 'estado', 'arrow'];
  protected readonly empleados = signal<Empleado[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);

  protected readonly filtroForm = this.fb.nonNullable.group({
    busqueda: [''],
    estado: [''],
  });

  constructor() {
    this.pageTitleService.title.set('Empleados');

    const busqueda$ = this.filtroForm.controls.busqueda.valueChanges.pipe(
      startWith(this.filtroForm.controls.busqueda.value),
      debounceTime(350),
      distinctUntilChanged()
    );
    const estado$ = this.filtroForm.controls.estado.valueChanges.pipe(
      startWith(this.filtroForm.controls.estado.value)
    );

    combineLatest([busqueda$, estado$])
      .pipe(
        switchMap(([busqueda, estado]) => this.buscar(busqueda, estado)),
        takeUntilDestroyed()
      )
      .subscribe((empleados) => {
        this.empleados.set(empleados);
        this.cargando.set(false);
      });
  }

  private buscar(busqueda: string, estado: string): Observable<Empleado[]> {
    this.cargando.set(true);
    this.errorMensaje.set(null);

    return this.empleadoService.getAll({ busqueda: busqueda || undefined, estado: estado || undefined }).pipe(
      catchError(() => {
        this.errorMensaje.set('No se pudo cargar el listado de empleados.');
        return of<Empleado[]>([]);
      })
    );
  }

  protected recargar(): void {
    const { busqueda, estado } = this.filtroForm.getRawValue();
    this.buscar(busqueda, estado).subscribe((empleados) => {
      this.empleados.set(empleados);
      this.cargando.set(false);
    });
  }

  protected onNuevoEmpleado(): void {
    const dialogRef = this.dialog.open(EmpleadoFormDialog, { width: '480px' });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.recargar();
      }
    });
  }
}
