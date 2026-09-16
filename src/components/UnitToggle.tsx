import type { Unit } from '../types/weather';

interface UnitToggleProps {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

export default function UnitToggle({ unit, onChange }: UnitToggleProps) {
  return (
    <div
      aria-label="Unidade de temperatura"
      className="inline-flex w-fit rounded-xl border border-white/10 bg-white/5 p-1 shadow-glass backdrop-blur-md"
      role="group"
    >
      <button
        aria-label="Usar graus Celsius"
        aria-pressed={unit === 'celsius'}
        className="min-h-10 min-w-14 rounded-lg px-3 py-2 text-sm font-semibold text-white outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-accent-400 aria-pressed:bg-accent-500 aria-pressed:hover:bg-accent-400"
        onClick={() => onChange('celsius')}
        type="button"
      >
        °C
      </button>
      <button
        aria-label="Usar graus Fahrenheit"
        aria-pressed={unit === 'fahrenheit'}
        className="min-h-10 min-w-14 rounded-lg px-3 py-2 text-sm font-semibold text-white outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-accent-400 aria-pressed:bg-accent-500 aria-pressed:hover:bg-accent-400"
        onClick={() => onChange('fahrenheit')}
        type="button"
      >
        °F
      </button>
    </div>
  );
}
