import { getWeatherCondition } from '../../src/lib/weatherCodes';

describe('getWeatherCondition', () => {
  it('returns the label and icon for a known WMO code', () => {
    expect(getWeatherCondition(61)).toEqual({
      label: 'Chuva fraca',
      icon: '🌦',
    });
  });

  it('returns the fallback for an unknown code', () => {
    expect(getWeatherCondition(999)).toEqual({
      label: 'Condição indisponível',
      icon: '—',
    });
  });
});
