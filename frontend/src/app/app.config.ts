import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideNativeDateAdapter(),
    // Sin esto, NativeDateAdapter usa el locale por defecto (en-US, mes/día/
    // año) tanto para el datepicker como para el texto que se escribe a
    // mano en el input — con es-CL queda día/mes/año en los dos casos.
    { provide: MAT_DATE_LOCALE, useValue: 'es-CL' },
  ],
};
