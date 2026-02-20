import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import type { Drawing } from '../core/models/drawing.model';
import { StorageService } from '../core/services/storage.service';

export interface DrawingState {
  drawings: Drawing[];
  selectedDrawing: Drawing | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DrawingState = {
  drawings: [],
  selectedDrawing: null,
  isLoading: false,
  error: null
};

export const DrawingStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    drawingsCount: computed(() => store.drawings().length),
    sortedDrawings: computed(() =>
      [...store.drawings()].sort((a, b) => b.updatedAt - a.updatedAt)
    ),
    hasDrawings: computed(() => store.drawings().length > 0)
  })),
  withMethods((store, storageService = inject(StorageService)) => ({
    loadDrawings(): void {
      patchState(store, { isLoading: true, error: null });
      try {
        const drawings = storageService.getAllDrawings();
        patchState(store, { drawings, isLoading: false });
      } catch (error) {
        patchState(store, {
          error: 'Failed to load drawings',
          isLoading: false
        });
      }
    },

    selectDrawing(drawing: Drawing | null): void {
      patchState(store, { selectedDrawing: drawing });
    },

    saveDrawing(drawing: Drawing): void {
      try {
        storageService.saveDrawing(drawing);
        const drawings = storageService.getAllDrawings();
        patchState(store, { drawings });
      } catch (error) {
        patchState(store, { error: 'Failed to save drawing' });
      }
    },

    createDrawing(drawingData: Omit<Drawing, 'id' | 'createdAt' | 'updatedAt'>): Drawing {
      const now = Date.now();
      const newDrawing: Drawing = {
        ...drawingData,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now
      };

      try {
        storageService.saveDrawing(newDrawing);
        const drawings = storageService.getAllDrawings();
        patchState(store, { drawings, selectedDrawing: newDrawing });
        return newDrawing;
      } catch (error) {
        patchState(store, { error: 'Failed to create drawing' });
        throw error;
      }
    },

    deleteDrawing(id: string): void {
      try {
        storageService.deleteDrawing(id);
        const drawings = storageService.getAllDrawings();
        patchState(store, { drawings });
      } catch (error) {
        patchState(store, { error: 'Failed to delete drawing' });
      }
    },

    deleteAllDrawings(): void {
      try {
        storageService.deleteAllDrawings();
        patchState(store, { drawings: [] });
      } catch (error) {
        patchState(store, { error: 'Failed to clear drawings' });
      }
    },

    clearError(): void {
      patchState(store, { error: null });
    }
  }))
);
