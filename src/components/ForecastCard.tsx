import { formatDayLabel } from '../lib/format';
import { formatTemperature } from '../lib/temperature';
import { getWeatherCondition } from '../lib/weatherCodes';
import type { ForecastDay, Unit } from '../types/weather';

interface ForecastCardProps {
  day: ForecastDay;
  index: number;
  unit: Unit;
}

export default function ForecastCard({ day, index, unit }: ForecastCardProps) {
  const condition = getWeatherCondition(day.weatherCode);
  const precipitation =
    typeof day.precipitationProbability !== 'number' ||
    !Number.isFinite(day.precipitationProbability)
      ? '—'
      : `${Math.round(day.precipitationProbability)}%`;

  return (
    <article
      aria-label={`${formatDayLabel(day.date, index)}: ${condition.label}`}
      className="flex min-w-0 flex-col rounded-2xl border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md"
    >
      <p className="text-sm font-semibold capitalize text-white">
        {formatDayLabel(day.date, index)}
      </p>
      <span aria-hidden="true" className="mt-4 text-4xl leading-none">
        {condition.icon}
      </span>
      <p className="mt-3 min-h-10 text-sm text-white">{condition.label}</p>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-lg font-bold text-white">
          <span className="sr-only">Máxima: </span>
          {formatTemperature(day.temperatureMaxCelsius, unit)}
        </span>
        <span className="text-sm text-white/80">
          <span className="sr-only">Mínima: </span>
          {formatTemperature(day.temperatureMinCelsius, unit)}
        </span>
      </div>
      <p className="mt-3 text-xs text-white/75">
        Chuva: <span className="font-semibold text-white">{precipitation}</span>
      </p>
    </article>
  );
}
