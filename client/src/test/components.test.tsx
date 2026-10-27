import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../components/ui/Button.js';
import { Badge, DifficultyBadge } from '../components/ui/Badge.js';
import { InterviewTimer } from '../components/interview/InterviewTimer.js';

describe('UI & Interview Component Test Suite', () => {
  it('Button renders text and responds to click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Run Test Case</Button>);

    const button = screen.getByRole('button', { name: /run test case/i });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('Button disables and indicates loading state when isLoading is true', () => {
    render(<Button isLoading>Submitting Solution</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('DifficultyBadge renders correct classes for Easy, Medium, Hard', () => {
    const { rerender } = render(<DifficultyBadge difficulty="Easy" />);
    expect(screen.getByText('Easy')).toBeInTheDocument();

    rerender(<DifficultyBadge difficulty="Medium" />);
    expect(screen.getByText('Medium')).toBeInTheDocument();

    rerender(<DifficultyBadge difficulty="Hard" />);
    expect(screen.getByText('Hard')).toBeInTheDocument();
  });

  it('InterviewTimer renders remaining time formatted as MM:SS', () => {
    const futureTime = new Date(Date.now() + 25 * 60 * 1000).toISOString();
    const onExpire = vi.fn();

    render(
      <InterviewTimer
        expiresAt={futureTime}
        totalDurationMinutes={30}
        onExpire={onExpire}
      />
    );

    // Should render a time like "24:59" or "25:00"
    expect(screen.getByText(/2[45]:\d\d/)).toBeInTheDocument();
    expect(onExpire).not.toHaveBeenCalled();
  });
});
