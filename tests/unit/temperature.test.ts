import { convertTemperature, formatTemperature, unitLabel } from '../../src/lib/temperature';

describe('temperature helpers', () => {
  describe('convertTemperature', () => {
    it.each([
      [0, 32],
      [100, 212],
      [-40, -40],
    ])('%s°C converts to %s°F', (celsius, fahrenheit) => {
      expect(convertTemperature(celsius, 'fahrenheit')).toBe(fahrenheit);
    });

    it('returns the original value for Celsius', () => {
      expect(convertTemperature(23.5, 'celsius')).toBe(23.5);
    });

    it('converts values according to the selected unit', () => {
      expect(convertTemperature(20, 'celsius')).toBe(20);
      expect(convertTemperature(20, 'fahrenheit')).toBe(68);
    });
  });

  describe('formatTemperature', () => {
    it('rounds the value and appends the Celsius symbol', () => {
      expect(formatTemperature(22.4, 'celsius')).toBe('22°C');
      expect(formatTemperature(22.5, 'celsius')).toBe('23°C');
    });

    it('rounds the value and appends the Fahrenheit symbol', () => {
      expect(formatTemperature(20.2, 'fahrenheit')).toBe('68°F');
    });

    it('does not render an invalid temperature as a number', () => {
      expect(formatTemperature(Number.NaN, 'celsius')).toBe('—');
    });
  });

  describe('unitLabel', () => {
    it('returns the symbol for Celsius', () => {
      expect(unitLabel('celsius')).toBe('°C');
    });

    it('returns the symbol for Fahrenheit', () => {
      expect(unitLabel('fahrenheit')).toBe('°F');
    });
  });
});
