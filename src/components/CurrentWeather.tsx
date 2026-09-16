import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherData;
  unit: Unit;
}

interface MetricProps {
  label: string;
  value: string;
}

function formatMetric(value: number | undefined, suffix: string): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? `${Math.round(value)}${suffix}`
    : '—';
}

function formatPrecipitation(value: number | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? `${value.toFixed(1)} mm` : '—';
}

function Metric({ label, value }: MetricProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <dt className="text-xs text-white/60">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-white">{value}</dd>
    </div>
  );
}

export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const condition = getWeatherCondition(current.weatherCode);
  const metrics = [
    { label: 'Umidade', value: formatMetric(current.relativeHumidity, '%') },
    { label: 'Vento', value: formatMetric(current.windSpeedKmh, ' km/h') },
    { label: 'Precipitação', value: formatPrecipitation(current.precipitationMm) },
    { label: 'Pressão', value: formatMetric(current.pressureHpa, ' hPa') },
  ] satisfies MetricProps[];

  return (
    <section
      aria-labelledby="current-weather-title"
      className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-glass backdrop-blur-md sm:p-8"
    >
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-accent-400">Agora</p>
          <h2 className="mt-2 break-words text-2xl font-bold text-white" id="current-weather-title">
            {city.name}
          </h2>
          <p className="mt-1 break-words text-sm text-white/80">
            {[city.region, city.country].filter(Boolean).join(', ')}
          </p>
          <p className="mt-4 text-sm text-white/80">{current.time.replace('T', ' ')}</p>
        </div>

        <div className="flex items-center gap-4">
          <span aria-hidden="true" className="text-6xl leading-none">
            {condition.icon}
          </span>
          <div>
            <p className="text-6xl font-bold tracking-tight text-white">
              {formatTemperature(current.temperatureCelsius, unit)}
            </p>
            <p className="mt-2 text-base text-white">{condition.label}</p>
          </div>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((metric) => (
          <Metric key={metric.label} {...metric} />
        ))}
      </dl>
    </section>
  );
}
