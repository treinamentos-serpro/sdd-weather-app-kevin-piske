import {
  fetchWithTimeout,
  getWeather,
  searchCities,
  WeatherServiceError,
} from '../../src/services/weatherService';
import type { City } from '../../src/types/weather';

const city: City = {
  id: 3451190,
  name: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
  country: 'Brasil',
  countryCode: 'BR',
  region: 'São Paulo',
  timezone: 'America/Sao_Paulo',
};

function mockJsonResponse(body: unknown, ok = true, status = 200): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as Response;
}

describe('weather services', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('fetchWithTimeout', () => {
    it('converts network failures to WeatherServiceError', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

      await expect(fetchWithTimeout('https://example.test/weather')).rejects.toMatchObject({
        name: 'WeatherServiceError',
        message: 'Falha de rede.',
      });
    });

    it('converts AbortError to a timeout WeatherServiceError', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new DOMException('The operation was aborted.', 'AbortError')),
      );

      await expect(fetchWithTimeout('https://example.test/weather')).rejects.toMatchObject({
        name: 'WeatherServiceError',
        message: 'A requisição demorou demais.',
      });
    });
  });

  describe('searchCities', () => {
    it('does not call fetch for an empty input', async () => {
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);

      await expect(searchCities('   ')).resolves.toEqual([]);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('maps geocoding results to City', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        mockJsonResponse({
          results: [
            {
              id: 1,
              name: 'São Paulo',
              latitude: -23.55,
              longitude: -46.63,
              country: 'Brasil',
              country_code: 'BR',
              admin1: 'São Paulo',
              timezone: 'America/Sao_Paulo',
            },
          ],
        }),
      );
      vi.stubGlobal('fetch', fetchMock);

      await expect(searchCities('São Paulo')).resolves.toEqual([
        {
          ...city,
          id: 1,
        },
      ]);
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('name=S%C3%A3o%20Paulo'),
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    });

    it('encodes accents and special characters in the search name', async () => {
      const fetchMock = vi.fn().mockResolvedValue(mockJsonResponse({ results: [] }));
      vi.stubGlobal('fetch', fetchMock);

      await searchCities('São José & Cia');

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('name=S%C3%A3o%20Jos%C3%A9%20%26%20Cia'),
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    });

    it('returns an empty list when results is absent', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockJsonResponse({})));

      await expect(searchCities('Atlantis')).resolves.toEqual([]);
    });

    it('throws WeatherServiceError for a non-ok geocoding response', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockJsonResponse({}, false, 503)));

      await expect(searchCities('São Paulo')).rejects.toMatchObject({
        name: 'WeatherServiceError',
        message: 'Não foi possível buscar cidades agora.',
      });
    });
  });

  describe('getWeather', () => {
    it('throws WeatherServiceError for a non-ok forecast response', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockJsonResponse({}, false, 502)));

      await expect(getWeather(city)).rejects.toMatchObject({
        name: 'WeatherServiceError',
        message: 'Não foi possível carregar o clima agora.',
      });
    });

    it('throws WeatherServiceError for invalid JSON from forecast', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: async () => {
            throw new SyntaxError('Unexpected token');
          },
        }),
      );

      await expect(getWeather(city)).rejects.toMatchObject({
        name: 'WeatherServiceError',
        message: 'Não foi possível interpretar a resposta do serviço.',
      });
    });

    it.each([
      [{ time: '2026-09-16T14:00', weather_code: 2 }, 'temperature_2m'],
      [{ time: '2026-09-16T14:00', temperature_2m: 20 }, 'weather_code'],
    ])('rejects current data without %s', async (current, missingField) => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          mockJsonResponse({
            current,
            daily: {
              time: ['1', '2', '3', '4', '5'],
              temperature_2m_min: [1, 1, 1, 1, 1],
              temperature_2m_max: [2, 2, 2, 2, 2],
              weather_code: [0, 0, 0, 0, 0],
            },
          }),
        ),
      );

      await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
      expect(missingField).toBeTruthy();
    });

    it('rejects daily arrays with incompatible lengths', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          mockJsonResponse({
            current: { time: '2026-09-16T14:00', temperature_2m: 20, weather_code: 0 },
            daily: {
              time: ['1', '2', '3', '4', '5'],
              temperature_2m_min: [1, 1, 1, 1],
              temperature_2m_max: [2, 2, 2, 2, 2],
              weather_code: [0, 0, 0, 0, 0],
            },
          }),
        ),
      );

      await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
    });

    it('maps current data and parallel daily arrays to five forecast days', async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        mockJsonResponse({
          timezone: 'America/Sao_Paulo',
          current: {
            time: '2026-09-16T14:00',
            temperature_2m: 22.4,
            apparent_temperature: 22.1,
            relative_humidity_2m: 65,
            wind_speed_10m: 12.3,
            precipitation: 0.4,
            pressure_msl: 1015.2,
            weather_code: 2,
          },
          daily: {
            time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
            temperature_2m_min: [16, 17, 18, 18, 17],
            temperature_2m_max: [25, 25, 26, 24, 24],
            weather_code: [2, 3, 61, 3, 1],
            precipitation_probability_max: [10, 20, 70, 35, 15],
          },
        }),
      );
      vi.stubGlobal('fetch', fetchMock);

      const weather = await getWeather(city);

      expect(weather.city).toEqual(city);
      expect(weather.timezone).toBe('America/Sao_Paulo');
      expect(weather.current).toMatchObject({
        time: '2026-09-16T14:00',
        temperatureCelsius: 22.4,
        apparentTemperatureCelsius: 22.1,
        relativeHumidity: 65,
        windSpeedKmh: 12.3,
        precipitationMm: 0.4,
        pressureHpa: 1015.2,
        weatherCode: 2,
      });
      expect(weather.forecast).toHaveLength(5);
      expect(weather.forecast).toEqual([
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
      ]);
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('current='),
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('daily='),
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    });

    it.each([
      ['formato inválido', ['2026-09-16', '2026-09-17', '2026-09-18T00:00', '2026-09-19', '2026-09-20']],
      ['data duplicada', ['2026-09-16', '2026-09-17', '2026-09-17', '2026-09-19', '2026-09-20']],
      ['fora de ordem', ['2026-09-16', '2026-09-18', '2026-09-17', '2026-09-19', '2026-09-20']],
      ['com lacuna', ['2026-09-16', '2026-09-17', '2026-09-19', '2026-09-20', '2026-09-21']],
    ])('rejects forecast dates with %s', async (_scenario, dates) => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          mockJsonResponse({
            current: {
              time: '2026-09-16T14:00',
              temperature_2m: 20,
              weather_code: 0,
            },
            daily: {
              time: dates,
              temperature_2m_min: [16, 17, 18, 18, 17],
              temperature_2m_max: [25, 25, 26, 24, 24],
              weather_code: [2, 3, 61, 3, 1],
            },
          }),
        ),
      );

      await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
    });

    it('maps null precipitation to zero', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          mockJsonResponse({
            current: {
              time: '2026-09-16T14:00',
              temperature_2m: 20,
              weather_code: 0,
              precipitation: null,
            },
            daily: {
              time: ['1', '2', '3', '4', '5'],
              temperature_2m_min: [1, 1, 1, 1, 1],
              temperature_2m_max: [2, 2, 2, 2, 2],
              weather_code: [0, 0, 0, 0, 0],
            },
          }),
        ),
      );

      const weather = await getWeather(city);

      expect(weather.current.precipitationMm).toBe(0);
    });

    it.each([
      [{ daily: {} }, 'daily'],
      [{ current: {} }, 'current'],
    ])('throws WeatherServiceError when %s is absent', async (payload, missingField) => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockJsonResponse(payload)));

      await expect(getWeather(city)).rejects.toBeInstanceOf(WeatherServiceError);
      expect(missingField).toBeTruthy();
    });
  });
});
