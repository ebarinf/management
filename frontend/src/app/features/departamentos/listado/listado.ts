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
import { Observable, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  startWith,
  switchMap,
} from 'rxjs/operators';

import { Departamento, DepartamentoService } from '../../../core/departamento.service';
import { PageTitleService } from '../../../core/page-title.service';
import { DepartamentoFormDialog } from '../departamento-form-dialog/departamento-form-dialog';

@Component({
  selector: 'app-departamentos-listado',
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
export class DepartamentosListado {
  private readonly fb = inject(FormBuilder);
  private readonly departamentoService = inject(DepartamentoService);
  private readonly pageTitleService = inject(PageTitleService);
  private readonly dialog = inject(MatDialog);

  protected readonly columnas = ['nombre', 'ubicacion', 'arrow'];
  protected readonly departamentos = signal<Departamento[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);

  protected readonly filtroForm = this.fb.nonNullable.group({
    busqueda: [''],
  });

  constructor() {
    this.pageTitleService.title.set('Departamentos');

    const busqueda$ = this.filtroForm.controls.busqueda.valueChanges.pipe(
      startWith(this.filtroForm.controls.busqueda.value),
      debounceTime(350),
      distinctUntilChanged(),
    );

    busqueda$
      .pipe(
        switchMap((busqueda) => this.buscar(busqueda)),
        takeUntilDestroyed(),
      )
      .subscribe((departamentos) => {
        this.departamentos.set(departamentos);
        this.cargando.set(false);
      });
  }

  private buscar(busqueda: string): Observable<Departamento[]> {
    this.cargando.set(true);
    this.errorMensaje.set(null);

    return this.departamentoService
      .getAll({ nombre: busqueda || undefined, ubicacion: busqueda || undefined })
      .pipe(
        catchError(() => {
          this.errorMensaje.set('No se pudo cargar el listado de departamentos.');
          return of<Departamento[]>([]);
        }),
      );
  }

  protected recargar(): void {
    const { busqueda } = this.filtroForm.getRawValue();
    this.buscar(busqueda).subscribe((departamentos) => {
      this.departamentos.set(departamentos);
      this.cargando.set(false);
    });
  }

  protected onNuevoDepartamento(): void {
    const dialogRef = this.dialog.open(DepartamentoFormDialog, { width: '480px' });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.recargar();
      }
    });
  }
}
