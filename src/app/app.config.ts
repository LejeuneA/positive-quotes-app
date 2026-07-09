import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    /* It tells Angular which routes we will use */
    provideRouter(routes),
    provideHttpClient(),
    /* For Angular Material and smooth transitions */
    provideAnimationsAsync(),
  ],
};
