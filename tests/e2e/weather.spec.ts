import { expect, test } from '@playwright/test';

test('busca uma cidade, exibe a previsão e converte a temperatura', async ({ page }) => {
  await page.route('https://geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            id: 1,
            name: 'Curitiba',
            latitude: -25.43,
            longitude: -49.27,
            country: 'Brasil',
            country_code: 'BR',
            admin1: 'Paraná',
            timezone: 'America/Sao_Paulo',
          },
        ],
      }),
    });
  });

  await page.route('https://api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        timezone: 'America/Sao_Paulo',
        current: {
          time: '2026-09-16T14:00',
          temperature_2m: 0,
          apparent_temperature: 0,
          relative_humidity_2m: 70,
          wind_speed_10m: 8,
          precipitation: 0,
          pressure_msl: 1018,
          weather_code: 0,
        },
        daily: {
          time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
          temperature_2m_min: [-4, -2, 1, 3, 4],
          temperature_2m_max: [0, 5, 8, 10, 12],
          weather_code: [0, 1, 2, 3, 61],
          precipitation_probability_max: [0, 10, 20, 30, 60],
        },
      }),
    });
  });

  await page.goto('/');
  await page.getByLabel('Cidade').fill('Curitiba');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Curitiba' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão para 5 dias' })).toBeVisible();
  await expect(page.getByText('0°C')).toBeVisible();

  await page.getByRole('button', { name: 'Usar graus Fahrenheit' }).click();

  await expect(page.getByText('32°F')).toBeVisible();
});

test('mostra mensagem quando o geocoding não retorna results', async ({ page }) => {
  await page.route('https://geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });

  await page.goto('/');
  await page.getByLabel('Cidade').fill('Cidade inexistente');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
});

test('mostra erro quando o forecast está incompleto', async ({ page }) => {
  await page.route('https://geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        results: [
          {
            id: 3,
            name: 'Manaus',
            latitude: -3.1,
            longitude: -60.0,
            country: 'Brasil',
            country_code: 'BR',
            admin1: 'Amazonas',
            timezone: 'America/Manaus',
          },
        ],
      }),
    });
  });

  await page.route('https://api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({
        timezone: 'America/Manaus',
        current: {
          time: '2026-09-16T14:00',
          temperature_2m: 30,
          weather_code: 1,
        },
      }),
    });
  });

  await page.goto('/');
  await page.getByLabel('Cidade').fill('Manaus');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('alert')).toContainText('Os dados do clima vieram incompletos.');
  await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
});

test.describe('fluxo principal mobile', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('renderiza o clima corretamente em 375x812', async ({ page }) => {
    await page.route('https://geocoding-api.open-meteo.com/**', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          results: [
            {
              id: 2,
              name: 'Recife',
              latitude: -8.05,
              longitude: -34.88,
              country: 'Brasil',
              country_code: 'BR',
              admin1: 'Pernambuco',
              timezone: 'America/Recife',
            },
          ],
        }),
      });
    });

    await page.route('https://api.open-meteo.com/**', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          timezone: 'America/Recife',
          current: {
            time: '2026-09-16T14:00',
            temperature_2m: 28,
            apparent_temperature: 30,
            relative_humidity_2m: 75,
            wind_speed_10m: 14,
            precipitation: 0,
            pressure_msl: 1012,
            weather_code: 1,
          },
          daily: {
            time: ['2026-09-16', '2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20'],
            temperature_2m_min: [24, 24, 25, 24, 24],
            temperature_2m_max: [29, 30, 30, 29, 30],
            weather_code: [1, 2, 3, 61, 2],
            precipitation_probability_max: [10, 20, 30, 60, 25],
          },
        }),
      });
    });

    await page.goto('/');
    await page.getByLabel('Cidade').fill('Recife');
    await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page.getByRole('heading', { name: 'Recife' })).toBeVisible();
    await expect(page.getByText('28°C')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Previsão para 5 dias' })).toBeVisible();
  });
});
