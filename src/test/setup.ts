import { vi } from 'vitest';

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
} as unknown as Storage;

// Mock window.matchMedia
global.matchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Mock crypto.randomUUID
global.crypto = {
  randomUUID: vi.fn(() => 'test-uuid-123'),
  getRandomValues: vi.fn(),
  subtle: {} as SubtleCrypto,
} as unknown as Crypto;

// Setup Angular testing utilities
import 'zone.js/dist/zone';
import 'zone.js/dist/zone-testing';
