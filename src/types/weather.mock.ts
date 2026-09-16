import type { WeatherData } from './weather';

export const mockWeatherData: WeatherData = {
  city: {
    id: 3451190,
    name: 'Sao Paulo',
    latitude: -23.5505,
    longitude: -46.6333,
    country: 'Brazil',
    countryCode: 'BR',
    region: 'Sao Paulo',
    timezone: 'America/Sao_Paulo',
  },
  timezone: 'America/Sao_Paulo',
  current: {
    time: '2026-09-16T14:00',
    temperatureCelsius: 22,
    apparentTemperatureCelsius: 22,
    relativeHumidity: 65,
    windSpeedKmh: 12,
    precipitationMm: 0,
    pressureHpa: 1015,
    weatherCode: 2,
  },
  forecast: [
    {
      date: '2026-09-16',
      temperatureMinCelsius: 16,
      temperatureMaxCelsius: 25,
      weatherCode: 2,
      precipitationProbability: 10,
    },
    {
      date: '2026-09-17',
      temperatureMinCelsius: 17,
      temperatureMaxCelsius: 25,
      weatherCode: 3,
      precipitationProbability: 20,
    },
    {
      date: '2026-09-18',
      temperatureMinCelsius: 18,
      temperatureMaxCelsius: 26,
      weatherCode: 61,
      precipitationProbability: 70,
    },
    {
      date: '2026-09-19',
      temperatureMinCelsius: 18,
      temperatureMaxCelsius: 24,
      weatherCode: 3,
      precipitationProbability: 35,
    },
    {
      date: '2026-09-20',
      temperatureMinCelsius: 17,
      temperatureMaxCelsius: 24,
      weatherCode: 1,
      precipitationProbability: 15,
    },
  ],
  fetchedAt: Date.parse('2026-09-16T17:00:00.000Z'),
};
