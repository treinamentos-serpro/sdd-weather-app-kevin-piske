import type { Unit } from '../types/weather';

export function convertTemperature(celsius: number, unit: Unit): number {
  if (!Number.isFinite(celsius)) {
    return Number.NaN;
  }

  return unit === 'fahrenheit' ? (celsius * 9) / 5 + 32 : celsius;
}

export function unitLabel(unit: Unit): string {
  return unit === 'fahrenheit' ? '°F' : '°C';
}

export function formatTemperature(celsius: number, unit: Unit): string {
  const converted = convertTemperature(celsius, unit);

  if (!Number.isFinite(converted)) {
    return '—';
  }

  return `${Math.round(converted)}${unitLabel(unit)}`;
}
