import { Injectable } from '@angular/core';
import type { Drawing } from '../models/drawing.model';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly STORAGE_KEY = 'draw-app-drawings';

  getAllDrawings(): Drawing[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading drawings from localStorage:', error);
      return [];
    }
  }

  saveDrawing(drawing: Drawing): void {
    try {
      const drawings = this.getAllDrawings();
      const existingIndex = drawings.findIndex(d => d.id === drawing.id);
      
      if (existingIndex >= 0) {
        drawings[existingIndex] = drawing;
      } else {
        drawings.push(drawing);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(drawings));
    } catch (error) {
      console.error('Error saving drawing to localStorage:', error);
      throw new Error('Failed to save drawing');
    }
  }

  deleteDrawing(id: string): void {
    try {
      const drawings = this.getAllDrawings();
      const filteredDrawings = drawings.filter(d => d.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredDrawings));
    } catch (error) {
      console.error('Error deleting drawing from localStorage:', error);
      throw new Error('Failed to delete drawing');
    }
  }

  deleteAllDrawings(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing drawings from localStorage:', error);
      throw new Error('Failed to clear drawings');
    }
  }

  getDrawingById(id: string): Drawing | undefined {
    const drawings = this.getAllDrawings();
    return drawings.find(d => d.id === id);
  }
}
