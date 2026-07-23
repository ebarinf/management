import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, combineLatest, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, startWith, switchMap } from 'rxjs/operators';

import { Certificacion, CertificacionService } from '../../../core/certificacion.service';
import { PageTitleService } from '../../../core/page-title.service';
import { CertificacionFormDialog } from '../certificacion-form-dialog/certificacion-form-dialog';

@Component({
  selector: 'app-certificaciones-listado',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './listado.html',
  styleUrl: './listado.scss',
})
export class CertificacionesListado {
  private readonly fb = inject(FormBuilder);
  private readonly certificacionService = inject(CertificacionService);
  private readonly pageTitleService = inject(PageTitleService);
  private readonly dialog = inject(MatDialog);

  protected readonly columnas = [
    'empleado',
    'departamento',
    'tipo',
    'numero',
    'emision',
    'vencimiento',
    'estado',
    'acciones',
  ];
  protected readonly certificaciones = signal<Certificacion[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);

  protected readonly filtroForm = this.fb.nonNullable.group({
    busqueda: [''],
    estado: [''],
  });

  constructor() {
    this.pageTitleService.title.set('Certificaciones');

    const busqueda$ = this.filtroForm.controls.busqueda.valueChanges.pipe(
      startWith(this.filtroForm.controls.busqueda.value),
      debounceTime(350),
      distinctUntilChanged(),
    );
    const estado$ = this.filtroForm.controls.estado.valueChanges.pipe(
      startWith(this.filtroForm.controls.estado.value),
    );

    combineLatest([busqueda$, estado$])
      .pipe(
        switchMap(([busqueda, estado]) => this.buscar(busqueda, estado)),
        takeUntilDestroyed(),
      )
      .subscribe((certificaciones) => {
        this.certificaciones.set(certificaciones);
        this.cargando.set(false);
      });
  }

  private buscar(busqueda: string, estado: string): Observable<Certificacion[]> {
    this.cargando.set(true);
    this.errorMensaje.set(null);

    return this.certificacionService
      .getAll({ busqueda: busqueda || undefined, estado: estado || undefined })
      .pipe(
        catchError(() => {
          this.errorMensaje.set('No se pudo cargar el listado de certificaciones.');
          return of<Certificacion[]>([]);
        }),
      );
  }

  protected recargar(): void {
    const { busqueda, estado } = this.filtroForm.getRawValue();
    this.buscar(busqueda, estado).subscribe((certificaciones) => {
      this.certificaciones.set(certificaciones);
      this.cargando.set(false);
    });
  }

  protected onNuevaCertificacion(): void {
    const dialogRef = this.dialog.open(CertificacionFormDialog, { width: '480px' });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.recargar();
      }
    });
  }

  protected onEditarCertificacion(certificacion: Certificacion): void {
    const dialogRef = this.dialog.open(CertificacionFormDialog, {
      width: '480px',
      data: { certificacion },
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.recargar();
      }
    });
  }

  protected onEliminarCertificacion(certificacion: Certificacion): void {
    const confirmado = confirm(`¿Eliminar la certificación "${certificacion.tipo}"?`);
    if (!confirmado) {
      return;
    }

    this.certificacionService.remove(certificacion.id).subscribe({
      next: () => this.recargar(),
      error: (error: HttpErrorResponse) => {
        this.errorMensaje.set(error.error?.message ?? 'No se pudo eliminar la certificación.');
      },
    });
  }
}
