import { act, renderHook, waitFor } from '@testing-library/react';
import { useWeather } from '../../src/hooks/useWeather';
import type { City, WeatherData } from '../../src/types/weather';

const { getWeatherMock, searchCitiesMock, WeatherServiceErrorMock } = vi.hoisted(() => ({
  getWeatherMock: vi.fn(),
  searchCitiesMock: vi.fn(),
  WeatherServiceErrorMock: class WeatherServiceError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'WeatherServiceError';
    }
  },
}));

vi.mock('../../src/services/weatherService', () => ({
  getWeather: getWeatherMock,
  searchCities: searchCitiesMock,
  WeatherServiceError: WeatherServiceErrorMock,
}));

const city: City = {
  id: 1,
  name: 'Curitiba',
  latitude: -25.43,
  longitude: -49.27,
  country: 'Brasil',
  countryCode: 'BR',
  region: 'Paraná',
  timezone: 'America/Sao_Paulo',
};

const weather: WeatherData = {
  city,
  timezone: 'America/Sao_Paulo',
  current: {
    time: '2026-09-16T14:00',
    temperatureCelsius: 20,
    weatherCode: 1,
  },
  forecast: [
    { date: '2026-09-16', temperatureMinCelsius: 10, temperatureMaxCelsius: 20, weatherCode: 1 },
    { date: '2026-09-17', temperatureMinCelsius: 11, temperatureMaxCelsius: 21, weatherCode: 2 },
    { date: '2026-09-18', temperatureMinCelsius: 12, temperatureMaxCelsius: 22, weatherCode: 3 },
    { date: '2026-09-19', temperatureMinCelsius: 13, temperatureMaxCelsius: 23, weatherCode: 61 },
    { date: '2026-09-20', temperatureMinCelsius: 14, temperatureMaxCelsius: 24, weatherCode: 0 },
  ],
  fetchedAt: 0,
};

describe('useWeather error recovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes a friendly offline error and retries the last city search', async () => {
    searchCitiesMock
      .mockRejectedValueOnce(new WeatherServiceErrorMock('Falha de rede.'))
      .mockResolvedValueOnce([city]);
    getWeatherMock.mockResolvedValue(weather);

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Curitiba');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Falha de rede.');

    await act(async () => {
      await result.current.retry();
    });

    await waitFor(() => expect(result.current.status).toBe('selection'));
    expect(searchCitiesMock).toHaveBeenCalledTimes(2);
    expect(result.current.cities).toEqual([city]);
    expect(getWeatherMock).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.selectCity(city);
    });

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(getWeatherMock).toHaveBeenCalledWith(city);
  });

  it('retries forecast without repeating the geocoding operation', async () => {
    searchCitiesMock.mockResolvedValue([city]);
    getWeatherMock.mockRejectedValueOnce(new WeatherServiceErrorMock('Falha de rede.'));
    getWeatherMock.mockResolvedValueOnce(weather);

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Curitiba');
    });

    expect(result.current.status).toBe('selection');
    expect(getWeatherMock).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.selectCity(city);
    });

    expect(result.current.status).toBe('error');

    await act(async () => {
      await result.current.retry();
    });

    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(searchCitiesMock).toHaveBeenCalledOnce();
    expect(getWeatherMock).toHaveBeenCalledTimes(2);
  });

  it('keeps the geocoding results available for explicit selection', async () => {
    searchCitiesMock.mockResolvedValue([city]);

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.search('Curitiba');
    });

    expect(result.current.status).toBe('selection');
    expect(result.current.cities).toEqual([city]);
    expect(getWeatherMock).not.toHaveBeenCalled();
  });
});
