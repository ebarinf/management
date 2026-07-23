import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Certificacion {
  id: number;
  empleadoId: number;
  departamentoId: number;
  tipo: string;
  numero: string | null;
  fechaEmision: string;
  fechaVencimiento: string | null;
  estado: string;
  empleado?: { id: number; nombres: string; apellidos: string };
  departamento?: { id: number; nombre: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface CertificacionFiltro {
  busqueda?: string;
  estado?: string;
}

export type CertificacionInput = Pick<
  Certificacion,
  'empleadoId' | 'departamentoId' | 'tipo' | 'fechaEmision'
> &
  Partial<Pick<Certificacion, 'numero' | 'fechaVencimiento' | 'estado'>>;

const BASE_URL = '/api/certificaciones';

@Injectable({ providedIn: 'root' })
export class CertificacionService {
  private readonly http = inject(HttpClient);

  getAll(filtro: CertificacionFiltro = {}): Observable<Certificacion[]> {
    let params = new HttpParams();
    if (filtro.busqueda) {
      params = params.set('busqueda', filtro.busqueda);
    }
    if (filtro.estado) {
      params = params.set('estado', filtro.estado);
    }

    return this.http.get<Certificacion[]>(BASE_URL, { params });
  }

  getById(id: number): Observable<Certificacion> {
    return this.http.get<Certificacion>(`${BASE_URL}/${id}`);
  }

  create(certificacion: CertificacionInput): Observable<Certificacion> {
    return this.http.post<Certificacion>(BASE_URL, certificacion);
  }

  update(id: number, certificacion: Partial<CertificacionInput>): Observable<Certificacion> {
    return this.http.put<Certificacion>(`${BASE_URL}/${id}`, certificacion);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE_URL}/${id}`);
  }
}
