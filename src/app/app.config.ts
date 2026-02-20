import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideTransloco({
      config: {
        availableLangs: ['fr', 'en'],
        defaultLang: 'fr',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: false,
      },
      loader: {
        provide: TranslocoService,
        useFactory: () => new TranslocoService(),
      },
    }),
  ],
};
