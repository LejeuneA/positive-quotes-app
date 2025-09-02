import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    /* Optimizes Angular change detection. */
    provideZoneChangeDetection({
      eventCoalescing: true,
    }),
    /* It tells Angular which routes we will use */
    provideRouter(routes),
    /* For Angular Material and smooth transitions */
    provideAnimationsAsync(),
  ],
};
