import { type FormEvent, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

export default function SearchBar({ onSearch, disabled = false }: SearchBarProps) {
  const [city, setCity] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedCity = city.trim();

    if (!normalizedCity || disabled) {
      return;
    }

    onSearch(normalizedCity);
  }

  return (
    <form
      aria-busy={disabled}
      aria-label="Buscar previsão do tempo"
      className="flex w-full flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-glass backdrop-blur-md sm:flex-row sm:items-end"
      onSubmit={handleSubmit}
      role="search"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <label className="text-sm font-medium text-white" htmlFor="city-search">
          Cidade
        </label>
        <input
          aria-describedby="city-search-hint"
          className="min-h-11 w-full rounded-xl border border-white/10 bg-night-800/80 px-4 py-2.5 text-white outline-none transition placeholder:text-white/75 focus-visible:border-accent-400 focus-visible:ring-2 focus-visible:ring-accent-400/50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={disabled}
          id="city-search"
          name="city"
          onChange={(event) => setCity(event.target.value)}
          placeholder="Digite o nome da cidade"
          type="search"
          value={city}
        />
        <span className="text-xs text-white/80" id="city-search-hint">
          Informe uma cidade para consultar o clima.
        </span>
      </div>
      <button
        className="min-h-11 rounded-xl bg-accent-500 px-5 py-2.5 font-semibold text-white transition hover:bg-accent-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        type="submit"
      >
        Buscar
      </button>
    </form>
  );
}
