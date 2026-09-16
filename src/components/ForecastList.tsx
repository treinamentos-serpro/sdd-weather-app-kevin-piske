import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: [ForecastDay, ForecastDay, ForecastDay, ForecastDay, ForecastDay];
  unit: Unit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-title">
      <h2 className="text-xl font-semibold text-white" id="forecast-title">
        Previsão para 5 dias
      </h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {forecast.map((day, index) => (
          <ForecastCard day={day} index={index} key={day.date} unit={unit} />
        ))}
      </div>
    </section>
  );
}
