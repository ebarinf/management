import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
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

import { Nave, NaveService } from '../../../core/nave.service';
import { Departamento, DepartamentoService } from '../../../core/departamento.service';
import { PageTitleService } from '../../../core/page-title.service';
import { NaveFormDialog } from '../nave-form-dialog/nave-form-dialog';

@Component({
  selector: 'app-naves-listado',
  imports: [
    ReactiveFormsModule,
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
export class NavesListado {
  private readonly fb = inject(FormBuilder);
  private readonly naveService = inject(NaveService);
  private readonly departamentoService = inject(DepartamentoService);
  private readonly pageTitleService = inject(PageTitleService);
  private readonly dialog = inject(MatDialog);

  protected readonly columnas = [
    'nombre',
    'numeroMatricula',
    'tipo',
    'eslora',
    'departamento',
    'estado',
    'acciones',
  ];
  protected readonly naves = signal<Nave[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly departamentos = signal<Departamento[]>([]);

  protected readonly filtroForm = this.fb.nonNullable.group({
    busqueda: [''],
    departamentoId: [''],
    estado: [''],
  });

  constructor() {
    this.pageTitleService.title.set('Naves');
    this.departamentoService.getAll().subscribe((departamentos) => this.departamentos.set(departamentos));

    const busqueda$ = this.filtroForm.controls.busqueda.valueChanges.pipe(
      startWith(this.filtroForm.controls.busqueda.value),
      debounceTime(350),
      distinctUntilChanged(),
    );
    const departamentoId$ = this.filtroForm.controls.departamentoId.valueChanges.pipe(
      startWith(this.filtroForm.controls.departamentoId.value),
    );
    const estado$ = this.filtroForm.controls.estado.valueChanges.pipe(
      startWith(this.filtroForm.controls.estado.value),
    );

    combineLatest([busqueda$, departamentoId$, estado$])
      .pipe(
        switchMap(([busqueda, departamentoId, estado]) => this.buscar(busqueda, departamentoId, estado)),
        takeUntilDestroyed(),
      )
      .subscribe((naves) => {
        this.naves.set(naves);
        this.cargando.set(false);
      });
  }

  private buscar(busqueda: string, departamentoId: string, estado: string): Observable<Nave[]> {
    this.cargando.set(true);
    this.errorMensaje.set(null);

    return this.naveService
      .getAll({
        busqueda: busqueda || undefined,
        departamentoId: departamentoId ? Number(departamentoId) : undefined,
        estado: estado || undefined,
      })
      .pipe(
        catchError(() => {
          this.errorMensaje.set('No se pudo cargar el listado de naves.');
          return of<Nave[]>([]);
        }),
      );
  }

  protected recargar(): void {
    const { busqueda, departamentoId, estado } = this.filtroForm.getRawValue();
    this.buscar(busqueda, departamentoId, estado).subscribe((naves) => {
      this.naves.set(naves);
      this.cargando.set(false);
    });
  }

  protected onNuevaNave(): void {
    const dialogRef = this.dialog.open(NaveFormDialog, { width: '480px' });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.recargar();
      }
    });
  }

  protected onEditarNave(nave: Nave): void {
    const dialogRef = this.dialog.open(NaveFormDialog, {
      width: '480px',
      data: { nave },
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.recargar();
      }
    });
  }

  protected onEliminarNave(nave: Nave): void {
    const confirmado = confirm(`¿Eliminar la nave "${nave.nombre}"?`);
    if (!confirmado) {
      return;
    }

    this.naveService.remove(nave.id).subscribe({
      next: () => this.recargar(),
      error: (error: HttpErrorResponse) => {
        this.errorMensaje.set(error.error?.message ?? 'No se pudo eliminar la nave.');
      },
    });
  }
}
