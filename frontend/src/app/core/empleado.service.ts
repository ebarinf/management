import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Empleado {
  id: number;
  rut: string;
  nombres: string;
  apellidos: string;
  email: string;
  estado: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmpleadoFiltro {
  busqueda?: string;
  estado?: string;
}

export type EmpleadoInput = Pick<Empleado, 'rut' | 'nombres' | 'apellidos' | 'email'> &
  Partial<Pick<Empleado, 'estado'>>;

const BASE_URL = '/api/empleados';

@Injectable({ providedIn: 'root' })
export class EmpleadoService {
  private readonly http = inject(HttpClient);

  getAll(filtro: EmpleadoFiltro = {}): Observable<Empleado[]> {
    let params = new HttpParams();
    if (filtro.busqueda) {
      params = params.set('busqueda', filtro.busqueda);
    }
    if (filtro.estado) {
      params = params.set('estado', filtro.estado);
    }

    return this.http.get<Empleado[]>(BASE_URL, { params });
  }

  getById(id: number): Observable<Empleado> {
    return this.http.get<Empleado>(`${BASE_URL}/${id}`);
  }

  create(empleado: EmpleadoInput): Observable<Empleado> {
    return this.http.post<Empleado>(BASE_URL, empleado);
  }

  update(id: number, empleado: Partial<EmpleadoInput>): Observable<Empleado> {
    return this.http.put<Empleado>(`${BASE_URL}/${id}`, empleado);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE_URL}/${id}`);
  }
}
