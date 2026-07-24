import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { Listado } from './features/empleados/listado/listado';
import { DepartamentosListado } from './features/departamentos/listado/listado';
import { CertificacionesListado } from './features/certificaciones/listado/listado';
import { NavesListado } from './features/naves/listado/listado';
import { Shell } from './layout/shell/shell';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: Login },
  {
    path: '',
    component: Shell,
    children: [
      // `data.title` documenta el título esperado de cada página; el título
      // real que muestra el Header lo setea cada componente vía
      // PageTitleService (ver constructor de Dashboard/Listado).
      { path: 'dashboard', component: Dashboard, data: { title: 'Dashboard' } },
      { path: 'empleados', component: Listado, data: { title: 'Empleados' } },
      { path: 'departamentos', component: DepartamentosListado, data: { title: 'Departamentos' } },
      {
        path: 'certificaciones',
        component: CertificacionesListado,
        data: { title: 'Certificaciones' },
      },
      { path: 'naves', component: NavesListado, data: { title: 'Naves' } },
    ],
  },
];
