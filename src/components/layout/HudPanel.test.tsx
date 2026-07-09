import React from 'react';
import { render } from '@testing-library/react';
import { HudPanel } from './HudPanel';
import { useAppStore } from '@/store/useAppStore';

// Mock the store
jest.mock('@/store/useAppStore', () => ({
  useAppStore: jest.fn(),
}));

describe('HudPanel Benchmark', () => {
  beforeEach(() => {
    (useAppStore as unknown as jest.Mock).mockReturnValue({ messages: [] });
  });

  it('measures render time', () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      const { unmount } = render(<HudPanel />);
      unmount();
    }
    const end = performance.now();
    console.log(`Render time for 1000 iterations: ${end - start} ms`);
  });
});
