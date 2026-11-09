import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toast } from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('announces a message and dismisses after a short delay', () => {
    const onDismiss = vi.fn();

    render(<Toast message="Icon added to collection" onDismiss={onDismiss} />);

    expect(screen.getByRole('status')).toHaveTextContent('Icon added to collection');

    act(() => {
      vi.advanceTimersByTime(2199);
    });
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders nothing without a message', () => {
    const { container } = render(<Toast message={null} onDismiss={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });
});
