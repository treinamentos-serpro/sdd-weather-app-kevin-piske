export type Unit = 'celsius' | 'fahrenheit';

export interface City {
  /** Identificador estável retornado pelo geocoding. */
  id: number;
  /** Nome da cidade. */
  name: string;
  /** Latitude da localidade. */
  latitude: number;
  /** Longitude da localidade. */
  longitude: number;
  /** Nome do país. */
  country: string;
  /** Código ISO do país. */
  countryCode: string;
  /** Estado ou região administrativa. */
  region?: string;
  /** Fuso horário IANA da localidade. */
  timezone?: string;
}

export interface CurrentWeather {
  /** Data e hora local no timezone da cidade. */
  time: string;
  /** Temperatura atual em Celsius. */
  temperatureCelsius: number;
  /** Sensação térmica em Celsius, quando disponível. */
  apparentTemperatureCelsius?: number;
  /** Umidade relativa do ar em porcentagem, quando disponível. */
  relativeHumidity?: number;
  /** Velocidade do vento em km/h, quando disponível. */
  windSpeedKmh?: number;
  /** Precipitação acumulada em milímetros, quando disponível. */
  precipitationMm?: number;
  /** Pressão atmosférica em hPa, quando disponível. */
  pressureHpa?: number;
  /** Código meteorológico WMO. */
  weatherCode: number;
}

export interface ForecastDay {
  /** Data local no formato ISO YYYY-MM-DD. */
  date: string;
  /** Temperatura mínima em Celsius. */
  temperatureMinCelsius: number;
  /** Temperatura máxima em Celsius. */
  temperatureMaxCelsius: number;
  /** Código meteorológico WMO do dia. */
  weatherCode: number;
  /** Probabilidade de precipitação em porcentagem, quando disponível. */
  precipitationProbability?: number;
}

export interface WeatherData {
  /** Cidade usada na consulta. */
  city: City;
  /** Fuso horário usado para interpretar datas e horários. */
  timezone: string;
  /** Condições meteorológicas atuais. */
  current: CurrentWeather;
  /** Dia atual e os quatro dias seguintes. */
  forecast: [ForecastDay, ForecastDay, ForecastDay, ForecastDay, ForecastDay];
  /** Timestamp em milissegundos da obtenção dos dados. */
  fetchedAt: number;
}
