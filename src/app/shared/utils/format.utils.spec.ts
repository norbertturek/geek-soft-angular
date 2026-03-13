import { describe, it, expect } from 'vitest';
import { formatSigned } from '@shared/utils/format.utils';

describe('formatSigned', () => {
  it('formats positive with + and 2 decimals by default', () => {
    expect(formatSigned(1.5)).toBe('+1.50');
    expect(formatSigned(0.01)).toBe('+0.01');
  });

  it('formats negative with - and 2 decimals by default', () => {
    expect(formatSigned(-1.5)).toBe('-1.50');
    expect(formatSigned(-0.01)).toBe('-0.01');
  });

  it('formats zero without sign with default decimals', () => {
    expect(formatSigned(0)).toBe('0.00');
  });

  it('respects maxDecimals', () => {
    expect(formatSigned(1.23456, 2)).toBe('+1.23');
    expect(formatSigned(-1.23456, 4)).toBe('-1.2346');
    expect(formatSigned(0, 4)).toBe('0.0000');
  });
});
