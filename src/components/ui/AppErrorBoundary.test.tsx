import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AppErrorBoundary from './AppErrorBoundary';

function BrokenPage(): ReactNode {
  throw new Error('Intentional boundary test');
}

describe('AppErrorBoundary', () => {
  afterEach(() => vi.restoreAllMocks());

  it('replaces a rendering failure with a user-facing recovery screen', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(<AppErrorBoundary><BrokenPage /></AppErrorBoundary>);

    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    expect(screen.getByRole('button', { name: 'Reload DataLens' })).toBeInTheDocument();
  });
});
