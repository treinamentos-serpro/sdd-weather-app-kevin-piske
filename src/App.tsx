import { useEffect, useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { Unit } from './types/weather';

export default function App() {
  const { data, error, retry, search, status } = useWeather();
  const [unit, setUnit] = useState<Unit>('celsius');
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (status !== 'idle' && status !== 'loading') {
      mainRef.current?.focus();
    }
  }, [status]);

  function renderContent() {
    switch (status) {
      case 'loading':
        return <LoadingState />;
      case 'empty':
        return <EmptyState hint="Tente buscar outra cidade ou confira a grafia informada." />;
      case 'error':
        return <ErrorState message={error ?? undefined} onRetry={retry} />;
      case 'success':
        if (!data) {
          return <ErrorState onRetry={retry} />;
        }

        return (
          <div className="space-y-6">
            <CurrentWeather city={data.city} current={data.current} unit={unit} />
            <ForecastList forecast={data.forecast} unit={unit} />
          </div>
        );
      default:
        return (
          <section className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-8 text-center shadow-glass backdrop-blur-md">
            <h2 className="text-xl font-semibold text-white">Consulte o clima de uma cidade</h2>
            <p className="mt-2 text-sm text-white/80">
              Busque uma cidade para visualizar as condições atuais e a previsão dos próximos dias.
            </p>
          </section>
        );
    }
  }

  return (
    <div className="min-h-screen bg-night-900 text-white">
      <a
        className="sr-only z-50 rounded-md bg-night-900 px-4 py-3 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:ring-2 focus:ring-accent-400"
        href="#main-content"
      >
        Ir para o conteúdo principal
      </a>
      <header className="border-b border-white/10 bg-night-900/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8 lg:py-6">
          <div className="shrink-0">
            <h1 className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-400">
              WeatherView
            </h1>
            <p className="mt-1 text-sm text-white/75">Clima claro para decidir o próximo passo.</p>
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-end">
            <SearchBar disabled={status === 'loading'} onSearch={search} />
            <UnitToggle onChange={setUnit} unit={unit} />
          </div>
        </div>
      </header>

      <main
        aria-busy={status === 'loading'}
        className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:py-10"
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
      >
        {renderContent()}
        <footer className="text-xs text-white/70">
          Dados meteorológicos demonstrativos baseados na Open-Meteo.
        </footer>
      </main>
    </div>
  );
}
