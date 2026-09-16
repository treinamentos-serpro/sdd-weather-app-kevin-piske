import { useRef, useState } from 'react';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'selection' | 'success' | 'error' | 'empty';

export interface UseWeatherResult {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

type LastOperation = { kind: 'search'; query: string } | { kind: 'weather'; city: City } | null;

function getErrorMessage(error: unknown): string {
  if (error instanceof WeatherServiceError) {
    return error.message;
  }

  return 'Não foi possível carregar os dados do clima. Tente novamente.';
}

export function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const requestId = useRef(0);
  const lastOperation = useRef<LastOperation>(null);

  async function loadWeather(city: City, operationId: number): Promise<void> {
    try {
      const weather = await getWeather(city);

      if (operationId !== requestId.current) {
        return;
      }

      setData(weather);
      setError(null);
      setStatus('success');
    } catch (cause) {
      if (operationId !== requestId.current) {
        return;
      }

      setData(null);
      setError(getErrorMessage(cause));
      setStatus('error');
    }
  }

  async function search(name: string): Promise<void> {
    const normalizedName = name.trim();
    const operationId = ++requestId.current;

    setQuery(normalizedName);
    setData(null);
    setError(null);
    setCities([]);

    if (!normalizedName) {
      lastOperation.current = null;
      setStatus('empty');
      return;
    }

    lastOperation.current = { kind: 'search', query: normalizedName };
    setStatus('loading');

    try {
      const results = await searchCities(normalizedName);

      if (operationId !== requestId.current) {
        return;
      }

      setCities(results);

      if (results.length === 0) {
        setStatus('empty');
        return;
      }

      setStatus('selection');
    } catch (cause) {
      if (operationId !== requestId.current) {
        return;
      }

      setError(getErrorMessage(cause));
      setStatus('error');
    }
  }

  async function selectCity(city: City): Promise<void> {
    const operationId = ++requestId.current;

    setQuery(city.name);
    setData(null);
    setError(null);
    setStatus('loading');
    lastOperation.current = { kind: 'weather', city };
    await loadWeather(city, operationId);
  }

  async function retry(): Promise<void> {
    const operation = lastOperation.current;

    if (!operation) {
      return;
    }

    if (operation.kind === 'search') {
      await search(operation.query);
      return;
    }

    await selectCity(operation.city);
  }

  return {
    status,
    data,
    cities,
    error,
    query,
    search,
    selectCity,
    retry,
  };
}
