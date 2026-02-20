import { ChangeDetectionStrategy, Component, HostBinding, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ThemeService } from './core/services/theme.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex flex-col transition-colors duration-300" [class.dark]="isDarkTheme()">
      <mat-toolbar 
        class="h-16 px-4 sm:px-6 flex justify-between items-center border-b-0 shadow-md transition-colors duration-300"
        [class.bg-slate-900]="isDarkTheme()"
        [class.text-white]="isDarkTheme()"
        [class.bg-white]="!isDarkTheme()"
        [class.text-slate-800]="!isDarkTheme()"
      >
        <div class="flex items-center gap-3">
          <mat-icon 
            class="w-8 h-8 text-3xl"
            [class.text-coral-400]="!isDarkTheme()"
            [class.text-coral-300]="isDarkTheme()"
            aria-hidden="true"
          >
            brush
          </mat-icon>
          <span class="text-xl font-display font-bold bg-gradient-to-r from-primary-500 to-magenta-500 bg-clip-text text-transparent">
            DrawApp
          </span>
        </div>

        <div class="flex items-center gap-2 sm:gap-4">
          <button
            mat-icon-button
            [attr.aria-label]="'header.toggleTheme' | transloco"
            (click)="themeService.toggleTheme()"
            class="transition-transform hover:scale-110"
          >
            <mat-icon class="material-icons-outlined">
              {{ isDarkTheme() ? 'light_mode' : 'dark_mode' }}
            </mat-icon>
          </button>

          <button
            mat-icon-button
            [attr.aria-label]="'header.toggleLanguage' | transloco"
            (click)="toggleLanguage()"
            class="font-bold text-sm w-10 h-10 flex items-center justify-center rounded-full transition-colors"
            [class.hover:bg-slate-700]="isDarkTheme()"
            [class.hover:bg-slate-100]="!isDarkTheme()"
          >
            {{ currentLang() | uppercase }}
          </button>
        </div>
      </mat-toolbar>

      <main class="flex-1 flex flex-col overflow-hidden">
        <router-outlet />
      </main>
    </div>
  `
})
export class AppComponent implements OnInit {
  protected readonly themeService = inject(ThemeService);
  private readonly translocoService = inject(TranslocoService);
  
  readonly isDarkTheme = toSignal(this.themeService.isDarkTheme$, { initialValue: false });
  readonly currentLang = signal(this.translocoService.getActiveLang());

  ngOnInit(): void {
    this.themeService.initializeTheme();
  }

  toggleLanguage(): void {
    const currentLang = this.translocoService.getActiveLang();
    const newLang = currentLang === 'fr' ? 'en' : 'fr';
    this.translocoService.setActiveLang(newLang);
    this.currentLang.set(newLang);
  }
}
