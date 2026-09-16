import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import CurrentWeather from '../../src/components/CurrentWeather';
import SearchBar from '../../src/components/SearchBar';
import UnitToggle from '../../src/components/UnitToggle';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../../src/types/weather';

const city: City = {
  id: 1,
  name: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
  country: 'Brasil',
  countryCode: 'BR',
  region: 'São Paulo',
  timezone: 'America/Sao_Paulo',
};

const current: CurrentWeatherData = {
  time: '2026-09-16T14:00',
  temperatureCelsius: 0,
  weatherCode: 0,
};

describe('SearchBar', () => {
  it('does not call onSearch for an empty input', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);

    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('does not call onSearch when the input contains only spaces', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByLabelText('Cidade'), '   ');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it('calls onSearch with the entered city', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();

    render(<SearchBar onSearch={onSearch} />);

    await user.type(screen.getByLabelText('Cidade'), '  Curitiba  ');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onSearch).toHaveBeenCalledOnce();
    expect(onSearch).toHaveBeenCalledWith('Curitiba');
  });
});

describe('unit conversion in weather presentation', () => {
  function WeatherPresentation() {
    const [unit, setUnit] = useState<Unit>('celsius');

    return (
      <>
        <UnitToggle onChange={setUnit} unit={unit} />
        <CurrentWeather city={city} current={current} unit={unit} />
      </>
    );
  }

  it('shows 32°F after selecting Fahrenheit for a 0°C temperature', async () => {
    const user = userEvent.setup();

    render(<WeatherPresentation />);

    await user.click(screen.getByRole('button', { name: 'Usar graus Fahrenheit' }));

    expect(screen.getByText('32°F')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Usar graus Fahrenheit' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
