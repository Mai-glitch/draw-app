import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { DrawingStore } from './drawing.store';
import type { Drawing } from '../app/core/models/drawing.model';

const mockStorageService = {
  getAllDrawings: vi.fn(),
  saveDrawing: vi.fn(),
  deleteDrawing: vi.fn(),
  deleteAllDrawings: vi.fn(),
};

describe('DrawingStore', () => {
  let store: InstanceType<typeof DrawingStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: StorageService, useValue: mockStorageService }
      ]
    });
    store = TestBed.inject(DrawingStore);
    vi.clearAllMocks();
  });

  it('should create store with initial state', () => {
    expect(store.drawings()).toEqual([]);
    expect(store.selectedDrawing()).toBeNull();
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should load drawings from storage', () => {
    const mockDrawings: Drawing[] = [
      {
        id: '1',
        name: 'Test Drawing',
        dataUrl: 'data:image/png;base64,test',
        thumbnailDataUrl: 'data:image/png;base64,test',
        createdAt: 1000,
        updatedAt: 1000,
        width: 800,
        height: 600
      }
    ];
    
    mockStorageService.getAllDrawings.mockReturnValue(mockDrawings);
    
    store.loadDrawings();
    
    expect(store.drawings()).toEqual(mockDrawings);
    expect(store.isLoading()).toBe(false);
  });

  it('should handle loading errors', () => {
    mockStorageService.getAllDrawings.mockImplementation(() => {
      throw new Error('Storage error');
    });
    
    store.loadDrawings();
    
    expect(store.error()).toBe('Failed to load drawings');
    expect(store.isLoading()).toBe(false);
  });

  it('should create new drawing', () => {
    const newDrawing: Omit<Drawing, 'id' | 'createdAt' | 'updatedAt'> = {
      name: 'New Drawing',
      dataUrl: 'data:image/png;base64,new',
      thumbnailDataUrl: 'data:image/png;base64,new',
      width: 800,
      height: 600
    };
    
    mockStorageService.saveDrawing.mockReturnValue(undefined);
    mockStorageService.getAllDrawings.mockReturnValue([]);
    
    const result = store.createDrawing(newDrawing);
    
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.name).toBe(newDrawing.name);
    expect(mockStorageService.saveDrawing).toHaveBeenCalled();
  });

  it('should delete drawing', () => {
    const mockDrawings: Drawing[] = [
      {
        id: '1',
        name: 'Test',
        dataUrl: 'data:image/png;base64,test',
        thumbnailDataUrl: 'data:image/png;base64,test',
        createdAt: 1000,
        updatedAt: 1000,
        width: 800,
        height: 600
      }
    ];
    
    mockStorageService.getAllDrawings.mockReturnValue([]);
    
    store.deleteDrawing('1');
    
    expect(mockStorageService.deleteDrawing).toHaveBeenCalledWith('1');
  });

  it('should calculate derived state', () => {
    const mockDrawings: Drawing[] = [
      {
        id: '1',
        name: 'Drawing 1',
        dataUrl: 'data:image/png;base64,test1',
        thumbnailDataUrl: 'data:image/png;base64,test1',
        createdAt: 1000,
        updatedAt: 2000,
        width: 800,
        height: 600
      },
      {
        id: '2',
        name: 'Drawing 2',
        dataUrl: 'data:image/png;base64,test2',
        thumbnailDataUrl: 'data:image/png;base64,test2',
        createdAt: 1000,
        updatedAt: 1000,
        width: 800,
        height: 600
      }
    ];
    
    mockStorageService.getAllDrawings.mockReturnValue(mockDrawings);
    store.loadDrawings();
    
    expect(store.drawingsCount()).toBe(2);
    expect(store.hasDrawings()).toBe(true);
    expect(store.sortedDrawings()[0].id).toBe('1');
  });
});
