import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Nave {
  id: number;
  nombre: string;
  numeroMatricula: string;
  tipo: string | null;
  eslora: number | null;
  departamentoId: number;
  estado: string;
  departamento?: { id: number; nombre: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface NaveFiltro {
  busqueda?: string;
  departamentoId?: number;
  estado?: string;
}

export type NaveInput = Pick<Nave, 'nombre' | 'numeroMatricula' | 'departamentoId'> &
  Partial<Pick<Nave, 'tipo' | 'eslora' | 'estado'>>;

const BASE_URL = '/api/naves';

@Injectable({ providedIn: 'root' })
export class NaveService {
  private readonly http = inject(HttpClient);

  getAll(filtro: NaveFiltro = {}): Observable<Nave[]> {
    let params = new HttpParams();
    if (filtro.busqueda) {
      params = params.set('busqueda', filtro.busqueda);
    }
    if (filtro.departamentoId) {
      params = params.set('departamentoId', filtro.departamentoId);
    }
    if (filtro.estado) {
      params = params.set('estado', filtro.estado);
    }

    return this.http.get<Nave[]>(BASE_URL, { params });
  }

  getById(id: number): Observable<Nave> {
    return this.http.get<Nave>(`${BASE_URL}/${id}`);
  }

  create(nave: NaveInput): Observable<Nave> {
    return this.http.post<Nave>(BASE_URL, nave);
  }

  update(id: number, nave: Partial<NaveInput>): Observable<Nave> {
    return this.http.put<Nave>(`${BASE_URL}/${id}`, nave);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE_URL}/${id}`);
  }
}
