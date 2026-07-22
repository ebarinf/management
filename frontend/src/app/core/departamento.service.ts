import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Departamento {
  id: number;
  nombre: string;
  ubicacion: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartamentoFiltro {
  nombre?: string;
  ubicacion?: string;
}

export type DepartamentoInput = Pick<Departamento, 'nombre'> &
  Partial<Pick<Departamento, 'ubicacion'>>;

const BASE_URL = '/api/departamentos';

@Injectable({ providedIn: 'root' })
export class DepartamentoService {
  private readonly http = inject(HttpClient);

  getAll(filtro: DepartamentoFiltro = {}): Observable<Departamento[]> {
    let params = new HttpParams();
    if (filtro.nombre) {
      params = params.set('nombre', filtro.nombre);
    }
    if (filtro.ubicacion) {
      params = params.set('ubicacion', filtro.ubicacion);
    }

    return this.http.get<Departamento[]>(BASE_URL, { params });
  }

  getById(id: number): Observable<Departamento> {
    return this.http.get<Departamento>(`${BASE_URL}/${id}`);
  }

  create(departamento: DepartamentoInput): Observable<Departamento> {
    return this.http.post<Departamento>(BASE_URL, departamento);
  }

  update(id: number, departamento: Partial<DepartamentoInput>): Observable<Departamento> {
    return this.http.put<Departamento>(`${BASE_URL}/${id}`, departamento);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE_URL}/${id}`);
  }
}
