import { formatDayLabel, getShortDate } from '../../src/lib/format';

describe('date formatting helpers', () => {
  it('labels the first forecast day as Hoje', () => {
    expect(formatDayLabel('2026-09-16', 0)).toBe('Hoje');
  });

  it('labels the second forecast day as Amanhã', () => {
    expect(formatDayLabel('2026-09-17', 1)).toBe('Amanhã');
  });

  it('uses the weekday for subsequent forecast days', () => {
    expect(formatDayLabel('2026-09-18', 2)).toMatch(/sex/i);
  });

  it('formats a date as day and month', () => {
    expect(getShortDate('2026-09-16')).toBe('16/09');
  });
});
