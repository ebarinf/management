import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HttpErrorResponse } from '@angular/common/http';

import {
  Departamento,
  DepartamentoInput,
  DepartamentoService,
} from '../../../core/departamento.service';

export interface DepartamentoFormDialogData {
  departamento?: Departamento;
}

@Component({
  selector: 'app-departamento-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './departamento-form-dialog.html',
  styleUrl: './departamento-form-dialog.scss',
})
export class DepartamentoFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly departamentoService = inject(DepartamentoService);
  private readonly dialogRef = inject(MatDialogRef<DepartamentoFormDialog>);
  private readonly data = inject<DepartamentoFormDialogData | null>(MAT_DIALOG_DATA, {
    optional: true,
  });

  protected readonly modoEdicion = !!this.data?.departamento;
  protected readonly titulo = this.modoEdicion ? 'Editar departamento' : 'Nuevo departamento';

  protected readonly enviando = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    nombre: [this.data?.departamento?.nombre ?? '', Validators.required],
    ubicacion: [this.data?.departamento?.ubicacion ?? ''],
  });

  protected onCancelar(): void {
    this.dialogRef.close();
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }

    const valores: DepartamentoInput = this.form.getRawValue();

    this.enviando.set(true);
    this.errorMensaje.set(null);

    const departamentoId = this.data?.departamento?.id;
    const request$ =
      this.modoEdicion && departamentoId !== undefined
        ? this.departamentoService.update(departamentoId, valores)
        : this.departamentoService.create(valores);

    request$.subscribe({
      next: (departamento) => {
        this.enviando.set(false);
        this.dialogRef.close(departamento);
      },
      error: (error: HttpErrorResponse) => {
        this.enviando.set(false);
        if (error.status === 400 || error.status === 409) {
          this.errorMensaje.set(error.error?.message ?? 'No se pudo guardar el departamento.');
        } else {
          this.errorMensaje.set('Ocurrió un error inesperado. Intenta nuevamente.');
        }
      },
    });
  }
}
