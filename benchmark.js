import React from 'react';
import { render } from '@testing-library/react';
import { HudPanel } from './src/components/layout/HudPanel';

const benchmark = () => {
  const start = performance.now();
  for (let i = 0; i < 1000; i++) {
    render(<HudPanel />);
  }
  const end = performance.now();
  console.log(`Render time for 1000 iterations: ${end - start} ms`);
};

benchmark();
