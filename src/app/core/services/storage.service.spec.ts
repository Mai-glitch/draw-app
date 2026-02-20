import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StorageService } from './storage.service';
import type { Drawing } from '../models/drawing.model';

describe('StorageService', () => {
  let service: StorageService;
  let mockLocalStorage: Record<string, string>;

  beforeEach(() => {
    service = new StorageService();
    mockLocalStorage = {};
    
    global.localStorage = {
      getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockLocalStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockLocalStorage[key];
      }),
      clear: vi.fn(() => {
        mockLocalStorage = {};
      }),
      length: 0,
      key: vi.fn(),
    } as unknown as Storage;
    
    vi.clearAllMocks();
  });

  it('should return empty array when no drawings exist', () => {
    const drawings = service.getAllDrawings();
    expect(drawings).toEqual([]);
  });

  it('should save and retrieve drawings', () => {
    const drawing: Drawing = {
      id: '1',
      name: 'Test Drawing',
      dataUrl: 'data:image/png;base64,test',
      thumbnailDataUrl: 'data:image/png;base64,test',
      createdAt: 1000,
      updatedAt: 1000,
      width: 800,
      height: 600
    };

    service.saveDrawing(drawing);
    const drawings = service.getAllDrawings();

    expect(drawings).toHaveLength(1);
    expect(drawings[0].id).toBe('1');
    expect(drawings[0].name).toBe('Test Drawing');
  });

  it('should delete a drawing', () => {
    const drawing: Drawing = {
      id: '1',
      name: 'Test',
      dataUrl: 'data:image/png;base64,test',
      thumbnailDataUrl: 'data:image/png;base64,test',
      createdAt: 1000,
      updatedAt: 1000,
      width: 800,
      height: 600
    };

    service.saveDrawing(drawing);
    service.deleteDrawing('1');
    const drawings = service.getAllDrawings();

    expect(drawings).toHaveLength(0);
  });

  it('should delete all drawings', () => {
    const drawing: Drawing = {
      id: '1',
      name: 'Test',
      dataUrl: 'data:image/png;base64,test',
      thumbnailDataUrl: 'data:image/png;base64,test',
      createdAt: 1000,
      updatedAt: 1000,
      width: 800,
      height: 600
    };

    service.saveDrawing(drawing);
    service.deleteAllDrawings();
    const drawings = service.getAllDrawings();

    expect(drawings).toHaveLength(0);
    expect(localStorage.removeItem).toHaveBeenCalledWith('draw-app-drawings');
  });

  it('should get drawing by id', () => {
    const drawing: Drawing = {
      id: 'test-id',
      name: 'Test',
      dataUrl: 'data:image/png;base64,test',
      thumbnailDataUrl: 'data:image/png;base64,test',
      createdAt: 1000,
      updatedAt: 1000,
      width: 800,
      height: 600
    };

    service.saveDrawing(drawing);
    const found = service.getDrawingById('test-id');
    const notFound = service.getDrawingById('non-existent');

    expect(found).toEqual(drawing);
    expect(notFound).toBeUndefined();
  });

  it('should update existing drawing', () => {
    const drawing: Drawing = {
      id: '1',
      name: 'Original',
      dataUrl: 'data:image/png;base64,original',
      thumbnailDataUrl: 'data:image/png;base64,original',
      createdAt: 1000,
      updatedAt: 1000,
      width: 800,
      height: 600
    };

    service.saveDrawing(drawing);
    
    const updatedDrawing = { ...drawing, name: 'Updated' };
    service.saveDrawing(updatedDrawing);
    
    const drawings = service.getAllDrawings();
    expect(drawings).toHaveLength(1);
    expect(drawings[0].name).toBe('Updated');
  });
});
