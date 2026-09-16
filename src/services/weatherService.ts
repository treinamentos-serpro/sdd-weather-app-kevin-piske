import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10_000;
const FORECAST_DAY_MS = 24 * 60 * 60 * 1000;
const FORECAST_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface GeocodingResult {
  id?: number | null;
  name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  country?: string | null;
  country_code?: string | null;
  admin1?: string | null;
  timezone?: string | null;
}

interface GeocodingResponse {
  results?: GeocodingResult[] | null;
}

interface ForecastCurrentResponse {
  time?: string | null;
  temperature_2m?: number | null;
  apparent_temperature?: number | null;
  relative_humidity_2m?: number | null;
  wind_speed_10m?: number | null;
  precipitation?: number | null;
  pressure_msl?: number | null;
  weather_code?: number | null;
}

interface ForecastDailyResponse {
  time?: Array<string | null> | null;
  temperature_2m_min?: Array<number | null> | null;
  temperature_2m_max?: Array<number | null> | null;
  weather_code?: Array<number | null> | null;
  precipitation_probability_max?: Array<number | null> | null;
}

interface ForecastResponse {
  timezone?: string | null;
  current?: ForecastCurrentResponse;
  daily?: ForecastDailyResponse;
}

function finiteOrUndefined(value: number | null | undefined): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function parseForecastDate(value: string): number | undefined {
  if (!FORECAST_DATE_PATTERN.test(value)) {
    return undefined;
  }

  const [year, month, day] = value.split('-').map(Number);
  const timestamp = Date.UTC(year, month - 1, day);
  const date = new Date(timestamp);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return undefined;
  }

  return timestamp;
}

function hasValidForecastDates(dates: Array<string | null>): boolean {
  const seenDates = new Set<string>();
  let previousTimestamp: number | undefined;

  for (const date of dates) {
    if (typeof date !== 'string') {
      return false;
    }

    if (seenDates.has(date)) {
      return false;
    }

    seenDates.add(date);

    const timestamp = parseForecastDate(date);

    if (timestamp === undefined) {
      return false;
    }

    if (previousTimestamp !== undefined && timestamp - previousTimestamp !== FORECAST_DAY_MS) {
      return false;
    }

    previousTimestamp = timestamp;
  }

  return true;
}

async function readJson<T>(response: Response): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new WeatherServiceError('Não foi possível interpretar a resposta do serviço.');
  }
}

export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    const errorName =
      error instanceof Error
        ? error.name
        : typeof error === 'object' && error !== null && 'name' in error
          ? error.name
          : undefined;

    if (errorName === 'AbortError') {
      throw new WeatherServiceError('A requisição demorou demais.');
    }

    throw new WeatherServiceError('Falha de rede.');
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function searchCities(name: string): Promise<City[]> {
  const normalizedName = name.trim();

  if (!normalizedName) {
    return [];
  }

  const url = `${GEOCODING_ENDPOINT}?name=${encodeURIComponent(normalizedName)}&count=10&language=pt&format=json`;
  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new WeatherServiceError('Não foi possível buscar cidades agora.');
  }

  const payload = await readJson<GeocodingResponse>(response);

  return (Array.isArray(payload.results) ? payload.results : [])
    .filter(
      (
        result,
      ): result is GeocodingResult & {
        id: number;
        name: string;
        latitude: number;
        longitude: number;
        country: string;
      } =>
        typeof result.id === 'number' &&
        typeof result.name === 'string' &&
        typeof result.latitude === 'number' &&
        Number.isFinite(result.latitude) &&
        result.latitude >= -90 &&
        result.latitude <= 90 &&
        typeof result.longitude === 'number' &&
        Number.isFinite(result.longitude) &&
        result.longitude >= -180 &&
        result.longitude <= 180 &&
        typeof result.country === 'string',
    )
    .map((result) => ({
      id: result.id,
      name: result.name,
      latitude: result.latitude,
      longitude: result.longitude,
      country: result.country,
      countryCode: result.country_code ?? '',
      region: result.admin1 ?? undefined,
      timezone: result.timezone ?? undefined,
    }));
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,precipitation,pressure_msl,weather_code',
    daily: 'temperature_2m_min,temperature_2m_max,weather_code,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: '5',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
  });
  const response = await fetchWithTimeout(`${FORECAST_ENDPOINT}?${params.toString()}`);

  if (!response.ok) {
    throw new WeatherServiceError('Não foi possível carregar o clima agora.');
  }

  const payload = await readJson<ForecastResponse>(response);

  if (!payload.current || !payload.daily) {
    throw new WeatherServiceError('Os dados do clima vieram incompletos.');
  }

  const { current, daily } = payload;
  const dates = daily.time;
  const minimumTemperatures = daily.temperature_2m_min;
  const maximumTemperatures = daily.temperature_2m_max;
  const weatherCodes = daily.weather_code;
  const hasFiveForecastDays =
    dates?.length === 5 &&
    minimumTemperatures?.length === 5 &&
    maximumTemperatures?.length === 5 &&
    weatherCodes?.length === 5;

  if (!hasFiveForecastDays) {
    throw new WeatherServiceError('A previsão recebida está incompleta.');
  }

  const hasValidCurrent =
    typeof current.time === 'string' &&
    finiteOrUndefined(current.temperature_2m) !== undefined &&
    finiteOrUndefined(current.weather_code) !== undefined;
  const hasValidDailyValues =
    dates.every((date) => typeof date === 'string') &&
    hasValidForecastDates(dates) &&
    minimumTemperatures.every((temperature) => finiteOrUndefined(temperature) !== undefined) &&
    maximumTemperatures.every((temperature) => finiteOrUndefined(temperature) !== undefined) &&
    weatherCodes.every((weatherCode) => finiteOrUndefined(weatherCode) !== undefined);

  if (!hasValidCurrent || !hasValidDailyValues) {
    throw new WeatherServiceError('Os dados do clima recebidos são inválidos.');
  }

  const currentWeather: CurrentWeather = {
    time: current.time as string,
    temperatureCelsius: finiteOrUndefined(current.temperature_2m) as number,
    apparentTemperatureCelsius: finiteOrUndefined(current.apparent_temperature),
    relativeHumidity: finiteOrUndefined(current.relative_humidity_2m),
    windSpeedKmh: finiteOrUndefined(current.wind_speed_10m),
    precipitationMm: finiteOrUndefined(current.precipitation),
    pressureHpa: finiteOrUndefined(current.pressure_msl),
    weatherCode: finiteOrUndefined(current.weather_code) as number,
  };

  if (!dates || !minimumTemperatures || !maximumTemperatures || !weatherCodes) {
    throw new WeatherServiceError('A previsão diária não está disponível.');
  }

  const forecast = dates.map(
    (date, index): ForecastDay => ({
      date,
      temperatureMinCelsius: finiteOrUndefined(minimumTemperatures[index]) as number,
      temperatureMaxCelsius: finiteOrUndefined(maximumTemperatures[index]) as number,
      weatherCode: finiteOrUndefined(weatherCodes[index]) as number,
      precipitationProbability: finiteOrUndefined(daily.precipitation_probability_max?.[index]),
    }),
  ) as WeatherData['forecast'];

  return {
    city,
    timezone: payload.timezone ?? city.timezone ?? 'UTC',
    current: currentWeather,
    forecast,
    fetchedAt: Date.now(),
  };
}
