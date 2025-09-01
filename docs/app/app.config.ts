import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router'; /* It tells Angular which routes we will use */

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; /* For Angular Material and smooth transitions */

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
  ],
};

/* provideZoneChangeDetection → optimizes Angular change detection. */
