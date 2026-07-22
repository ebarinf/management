import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HttpErrorResponse } from '@angular/common/http';

import { Empleado, EmpleadoInput, EmpleadoService } from '../../../core/empleado.service';

// Formato simple NNNNNNNN-K (7-8 dígitos, guion, dígito verificador o K).
// No valida el dígito verificador real, solo la forma del RUT.
const RUT_PATTERN = /^\d{7,8}-[\dkK]$/;

export interface EmpleadoFormDialogData {
  empleado?: Empleado;
}

@Component({
  selector: 'app-empleado-form-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './empleado-form-dialog.html',
  styleUrl: './empleado-form-dialog.scss',
})
export class EmpleadoFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly empleadoService = inject(EmpleadoService);
  private readonly dialogRef = inject(MatDialogRef<EmpleadoFormDialog>);
  private readonly data = inject<EmpleadoFormDialogData | null>(MAT_DIALOG_DATA, { optional: true });

  protected readonly modoEdicion = !!this.data?.empleado;
  protected readonly titulo = this.modoEdicion ? 'Editar empleado' : 'Nuevo empleado';

  protected readonly enviando = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    rut: [this.data?.empleado?.rut ?? '', [Validators.required, Validators.pattern(RUT_PATTERN)]],
    nombres: [this.data?.empleado?.nombres ?? '', Validators.required],
    apellidos: [this.data?.empleado?.apellidos ?? '', Validators.required],
    email: [this.data?.empleado?.email ?? '', [Validators.required, Validators.email]],
    estado: [this.data?.empleado?.estado ?? 'activo', Validators.required],
  });

  protected onCancelar(): void {
    this.dialogRef.close();
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.enviando()) {
      this.form.markAllAsTouched();
      return;
    }

    const valores: EmpleadoInput = this.form.getRawValue();

    this.enviando.set(true);
    this.errorMensaje.set(null);

    const empleadoId = this.data?.empleado?.id;
    const request$ =
      this.modoEdicion && empleadoId !== undefined
        ? this.empleadoService.update(empleadoId, valores)
        : this.empleadoService.create(valores);

    request$.subscribe({
      next: (empleado) => {
        this.enviando.set(false);
        this.dialogRef.close(empleado);
      },
      error: (error: HttpErrorResponse) => {
        this.enviando.set(false);
        if (error.status === 400 || error.status === 409) {
          this.errorMensaje.set(error.error?.message ?? 'No se pudo guardar el empleado.');
        } else {
          this.errorMensaje.set('Ocurrió un error inesperado. Intenta nuevamente.');
        }
      },
    });
  }
}
