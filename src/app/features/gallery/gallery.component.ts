import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslocoPipe } from '@jsverse/transloco';
import { DrawingStore } from '../../stores/drawing.store';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import type { Drawing } from '../../core/models/drawing.model';
import { DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT, FUNKY_COLORS } from '../../core/models/drawing.model';

@Component({
  selector: 'app-gallery',
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, MatDialogModule, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 dark:from-slate-900 dark:via-purple-950 dark:to-slate-900">
      
      <!-- Hero Section -->
      <div class="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4 bg-gradient-to-r from-primary-500 via-magenta-500 to-coral-500 bg-clip-text text-transparent">
          {{ 'gallery.title' | transloco }}
        </h1>
        <p class="text-lg text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
          {{ 'gallery.subtitle' | transloco }}
        </p>
        
        <button 
          mat-raised-button 
          color="primary"
          (click)="createNewDrawing()"
          class="px-6 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
        >
          <mat-icon class="mr-2">add</mat-icon>
          {{ 'gallery.newDrawing' | transloco }}
        </button>
      </div>

      <!-- Drawings Grid -->
      <div class="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pb-8">
        @if (store.hasDrawings()) {
          <div class="max-w-7xl mx-auto">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-semibold text-slate-800 dark:text-slate-200">
                {{ 'gallery.yourDrawings' | transloco }} 
                <span class="text-slate-500 dark:text-slate-400">({{ store.drawingsCount() }})</span>
              </h2>
              
              <button 
                mat-button 
                color="warn"
                (click)="deleteAllDrawings()"
                class="text-sm"
              >
                <mat-icon class="mr-1">delete_sweep</mat-icon>
                {{ 'gallery.deleteAll' | transloco }}
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              @for (drawing of store.sortedDrawings(); track drawing.id) {
                <mat-card 
                  class="cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl overflow-hidden group"
                  [class.bg-white]="true"
                  [class.dark:bg-slate-800]="true"
                  (click)="openDrawing(drawing)"
                  (keydown.enter)="openDrawing(drawing)"
                  tabindex="0"
                  role="button"
                >
                  <div class="relative aspect-[4/3] bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    @if (drawing.thumbnailDataUrl) {
                      <img 
                        [src]="drawing.thumbnailDataUrl" 
                        [alt]="drawing.name"
                        class="w-full h-full object-cover"
                        loading="lazy"
                      />
                    } @else {
                      <div class="w-full h-full flex items-center justify-center">
                        <mat-icon class="text-6xl text-slate-300 dark:text-slate-600">image</mat-icon>
                      </div>
                    }
                    
                    <!-- Hover Overlay -->
                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button 
                        mat-mini-fab 
                        color="primary"
                        class="scale-0 group-hover:scale-100 transition-transform duration-200"
                        (click)="openDrawing(drawing); $event.stopPropagation()"
                        [attr.aria-label]="'gallery.open' | transloco"
                      >
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button 
                        mat-mini-fab 
                        color="warn"
                        class="scale-0 group-hover:scale-100 transition-transform duration-200 delay-75"
                        (click)="deleteDrawing(drawing); $event.stopPropagation()"
                        [attr.aria-label]="'gallery.delete' | transloco"
                      >
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </div>

                  <mat-card-content class="p-4">
                    <h3 class="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {{ drawing.name }}
                    </h3>
                    <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {{ formatDate(drawing.updatedAt) }}
                    </p>
                  </mat-card-content>
                </mat-card>
              }
            </div>
          </div>
        } @else {
          <!-- Empty State -->
          <div class="flex flex-col items-center justify-center h-full py-16 text-center">
            <div class="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-primary-200 to-magenta-200 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
              <mat-icon class="text-5xl sm:text-6xl text-primary-600">palette</mat-icon>
            </div>
            <h2 class="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">
              {{ 'gallery.empty.title' | transloco }}
            </h2>
            <p class="text-slate-500 dark:text-slate-400 max-w-md">
              {{ 'gallery.empty.description' | transloco }}
            </p>
          </div>
        }
      </div>
    </div>
  `
})
export class GalleryComponent {
  protected readonly store = inject(DrawingStore);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  readonly currentDate = signal(new Date());

  constructor() {
    this.store.loadDrawings();
  }

  createNewDrawing(): void {
    const canvas = document.createElement('canvas');
    canvas.width = DEFAULT_CANVAS_WIDTH;
    canvas.height = DEFAULT_CANVAS_HEIGHT;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    const drawing = this.store.createDrawing({
      name: `Dessin ${this.store.drawingsCount() + 1}`,
      dataUrl: canvas.toDataURL(),
      thumbnailDataUrl: canvas.toDataURL(),
      width: DEFAULT_CANVAS_WIDTH,
      height: DEFAULT_CANVAS_HEIGHT
    });

    this.router.navigate(['/editor', drawing.id]);
  }

  openDrawing(drawing: Drawing): void {
    this.store.selectDrawing(drawing);
    this.router.navigate(['/editor', drawing.id]);
  }

  deleteDrawing(drawing: Drawing): void {
    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
      data: {
        title: 'gallery.deleteTitle',
        message: 'gallery.deleteMessage',
        confirmText: 'common.delete',
        cancelText: 'common.cancel',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.deleteDrawing(drawing.id);
      }
    });
  }

  deleteAllDrawings(): void {
    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
      data: {
        title: 'gallery.deleteAllTitle',
        message: 'gallery.deleteAllMessage',
        confirmText: 'common.delete',
        cancelText: 'common.cancel',
        confirmColor: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.deleteAllDrawings();
      }
    });
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
