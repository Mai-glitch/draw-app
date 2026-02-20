import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'draw-app-theme';
  private readonly isDarkThemeSubject = new BehaviorSubject<boolean>(false);
  
  readonly isDarkTheme$: Observable<boolean> = this.isDarkThemeSubject.asObservable();

  initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme) {
      this.isDarkThemeSubject.next(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkThemeSubject.next(prefersDark);
    }
  }

  toggleTheme(): void {
    const newTheme = !this.isDarkThemeSubject.value;
    this.isDarkThemeSubject.next(newTheme);
    localStorage.setItem(this.THEME_KEY, newTheme ? 'dark' : 'light');
  }

  isDarkTheme(): boolean {
    return this.isDarkThemeSubject.value;
  }
}
