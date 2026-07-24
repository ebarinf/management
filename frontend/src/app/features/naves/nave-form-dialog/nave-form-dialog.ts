import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HttpErrorResponse } from '@angular/common/http';

import { Nave, NaveInput, NaveService } from '../../../core/nave.service';
import { Departamento, DepartamentoService } from '../../../core/departamento.service';

export interface NaveFormDialogData {
  nave?: Nave;
}

@Component({
  selector: 'app-nave-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './nave-form-dialog.html',
  styleUrl: './nave-form-dialog.scss',
})
export class NaveFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly naveService = inject(NaveService);
  private readonly departamentoService = inject(DepartamentoService);
  private readonly dialogRef = inject(MatDialogRef<NaveFormDialog>);
  private readonly data = inject<NaveFormDialogData | null>(MAT_DIALOG_DATA, {
    optional: true,
  });

  protected readonly modoEdicion = !!this.data?.nave;
  protected readonly titulo = this.modoEdicion ? 'Editar nave' : 'Nueva nave';

  protected readonly enviando = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly departamentos = signal<Departamento[]>([]);

  protected readonly form = this.fb.group({
    nombre: this.fb.control(this.data?.nave?.nombre ?? '', {
      nonNullable: true,
      validators: Validators.required,
    }),
    numeroMatricula: this.fb.control(this.data?.nave?.numeroMatricula ?? '', {
      nonNullable: true,
      validators: Validators.required,
    }),
    tipo: this.fb.control(this.data?.nave?.tipo ?? '', { nonNullable: true }),
    eslora: this.fb.control<number | null>(this.data?.nave?.eslora ?? null),
    departamentoId: this.fb.control<number | null>(
      this.data?.nave?.departamentoId ?? null,
      Validators.required,
    ),
    estado: this.fb.control(this.data?.nave?.estado ?? 'activa', { nonNullable: true }),
  });

  constructor() {
    this.departamentoService.getAll().subscribe((departamentos) => this.departamentos.set(departamentos));
  }

  protected onCancelar(): void {
    this.dialogRef.close();
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }

    const valoresForm = this.form.getRawValue();
    const valores: NaveInput = {
      nombre: valoresForm.nombre,
      numeroMatricula: valoresForm.numeroMatricula,
      tipo: valoresForm.tipo,
      eslora: valoresForm.eslora,
      departamentoId: valoresForm.departamentoId!,
      estado: valoresForm.estado,
    };

    this.enviando.set(true);
    this.errorMensaje.set(null);

    const naveId = this.data?.nave?.id;
    const request$ =
      this.modoEdicion && naveId !== undefined
        ? this.naveService.update(naveId, valores)
        : this.naveService.create(valores);

    request$.subscribe({
      next: (nave) => {
        this.enviando.set(false);
        this.dialogRef.close(nave);
      },
      error: (error: HttpErrorResponse) => {
        this.enviando.set(false);
        if (error.status === 400 || error.status === 409) {
          this.errorMensaje.set(error.error?.message ?? 'No se pudo guardar la nave.');
        } else {
          this.errorMensaje.set('Ocurrió un error inesperado. Intenta nuevamente.');
        }
      },
    });
  }
}
