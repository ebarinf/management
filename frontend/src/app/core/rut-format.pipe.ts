import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'rutFormat' })
export class RutFormatPipe implements PipeTransform {
  transform(rut: string | null | undefined): string {
    if (!rut) {
      return '';
    }

    const [cuerpo, dv] = rut.split('-');
    if (!cuerpo || !dv) {
      return rut;
    }

    const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${cuerpoFormateado}-${dv}`;
  }
}
