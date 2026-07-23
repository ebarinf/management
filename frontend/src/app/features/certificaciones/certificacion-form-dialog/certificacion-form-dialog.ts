import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { HttpErrorResponse } from '@angular/common/http';

import {
  Certificacion,
  CertificacionInput,
  CertificacionService,
} from '../../../core/certificacion.service';
import { Empleado, EmpleadoService } from '../../../core/empleado.service';
import { Departamento, DepartamentoService } from '../../../core/departamento.service';

export interface CertificacionFormDialogData {
  certificacion?: Certificacion;
}

function fechaATexto(fecha: Date | null): string | undefined {
  if (!fecha) {
    return undefined;
  }
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

function textoAFecha(texto: string | null | undefined): Date | null {
  if (!texto) {
    return null;
  }
  const [anio, mes, dia] = texto.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

@Component({
  selector: 'app-certificacion-form-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
  ],
  templateUrl: './certificacion-form-dialog.html',
  styleUrl: './certificacion-form-dialog.scss',
})
export class CertificacionFormDialog {
  private readonly fb = inject(FormBuilder);
  private readonly certificacionService = inject(CertificacionService);
  private readonly empleadoService = inject(EmpleadoService);
  private readonly departamentoService = inject(DepartamentoService);
  private readonly dialogRef = inject(MatDialogRef<CertificacionFormDialog>);
  private readonly data = inject<CertificacionFormDialogData | null>(MAT_DIALOG_DATA, {
    optional: true,
  });

  protected readonly modoEdicion = !!this.data?.certificacion;
  protected readonly titulo = this.modoEdicion ? 'Editar certificación' : 'Nueva certificación';

  protected readonly enviando = signal(false);
  protected readonly errorMensaje = signal<string | null>(null);
  protected readonly empleados = signal<Empleado[]>([]);
  protected readonly departamentos = signal<Departamento[]>([]);

  protected readonly form = this.fb.group({
    empleadoId: this.fb.control<number | null>(
      this.data?.certificacion?.empleadoId ?? null,
      Validators.required,
    ),
    departamentoId: this.fb.control<number | null>(
      this.data?.certificacion?.departamentoId ?? null,
      Validators.required,
    ),
    tipo: this.fb.control(this.data?.certificacion?.tipo ?? '', {
      nonNullable: true,
      validators: Validators.required,
    }),
    numero: this.fb.control(this.data?.certificacion?.numero ?? '', { nonNullable: true }),
    fechaEmision: this.fb.control<Date | null>(
      textoAFecha(this.data?.certificacion?.fechaEmision),
      Validators.required,
    ),
    fechaVencimiento: this.fb.control<Date | null>(
      textoAFecha(this.data?.certificacion?.fechaVencimiento),
    ),
    estado: this.fb.control(this.data?.certificacion?.estado ?? 'vigente', {
      nonNullable: true,
    }),
  });

  constructor() {
    this.empleadoService.getAll().subscribe((empleados) => this.empleados.set(empleados));
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
    const valores: CertificacionInput = {
      empleadoId: valoresForm.empleadoId!,
      departamentoId: valoresForm.departamentoId!,
      tipo: valoresForm.tipo,
      numero: valoresForm.numero,
      fechaEmision: fechaATexto(valoresForm.fechaEmision)!,
      fechaVencimiento: fechaATexto(valoresForm.fechaVencimiento),
      estado: valoresForm.estado,
    };

    this.enviando.set(true);
    this.errorMensaje.set(null);

    const certificacionId = this.data?.certificacion?.id;
    const request$ =
      this.modoEdicion && certificacionId !== undefined
        ? this.certificacionService.update(certificacionId, valores)
        : this.certificacionService.create(valores);

    request$.subscribe({
      next: (certificacion) => {
        this.enviando.set(false);
        this.dialogRef.close(certificacion);
      },
      error: (error: HttpErrorResponse) => {
        this.enviando.set(false);
        if (error.status === 400 || error.status === 409) {
          this.errorMensaje.set(error.error?.message ?? 'No se pudo guardar la certificación.');
        } else {
          this.errorMensaje.set('Ocurrió un error inesperado. Intenta nuevamente.');
        }
      },
    });
  }
}
