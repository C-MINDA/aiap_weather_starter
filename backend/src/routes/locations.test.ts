import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { WeatherProviderError, type WeatherSnapshot } from '../weather.js';

const weather: WeatherSnapshot = {
  condition: 'Cloudy',
  observed_at: '2026-05-04T00:00:00Z',
  source: 'test',
  area: 'Bishan',
  valid_period_text: 'Now',
  temperature_c: 29,
  humidity_percent: 80,
  rainfall_mm: 0,
  wind_speed_knots: 4,
  wind_direction_degrees: 180,
  forecast_low_c: 25,
  forecast_high_c: 32,
  uv_index: 7,
  psi_twenty_four_hourly: 42,
  pm25_one_hourly: 9,
  air_quality_region: 'central',
  forecast_periods: [{ label: 'Now', forecast: 'Cloudy' }],
  daily_forecast: [
    {
      date: '2026-05-04',
      forecast: 'Cloudy',
      temperature_low_c: 25,
      temperature_high_c: 32,
    },
  ],
};

describe('locations API', () => {
  let tempDir: string;
  let app: Awaited<ReturnType<typeof import('../server.js').createApp>>;
  const weatherClient = {
    getCurrentWeather: vi.fn(async () => weather),
  };

  beforeAll(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'weather-starter-test-'));
    process.env.DATABASE_PATH = join(tempDir, 'weather.db');
    process.env.LOG_LEVEL = 'silent';

    const { createApp } = await import('../server.js');
    app = await createApp({
      serveFrontend: false,
      enableRequestLogging: false,
      weatherClient,
    });
  });

  beforeEach(async () => {
    const { resetStore } = await import('../db.js');
    await resetStore();
    weatherClient.getCurrentWeather.mockReset().mockResolvedValue(weather);
  });

  afterAll(async () => {
    const { closeDatabase } = await import('../db.js');
    closeDatabase();
    await rm(tempDir, { recursive: true, force: true });
  });

  it('returns the health status', async () => {
    await request(app).get('/health').expect(200).expect({ status: 'healthy' });
  });

  it('accepts valid frontend interaction logs', async () => {
    await request(app)
      .post('/api/logs')
      .send({
        event: 'weather.card.click',
        page: '/weather',
        metadata: { locationId: 1 },
      })
      .expect(204);
  });

  it('rejects missing or malformed frontend interaction events', async () => {
    await request(app)
      .post('/api/logs')
      .send({ page: '/weather' })
      .expect(422, { detail: 'event is required' });

    await request(app)
      .post('/api/logs')
      .send({ event: 'x' })
      .expect(422, { detail: 'event is required' });
  });

  it('refreshes weather when a location is created', async () => {
    const response = await request(app)
      .post('/api/locations')
      .send({ latitude: 1.35, longitude: 103.85 })
      .expect(201);

    expect(response.body).toMatchObject({
      id: 1,
      latitude: 1.35,
      longitude: 103.85,
      weather: {
        condition: 'Cloudy',
        area: 'Bishan',
        temperature_c: 29,
      },
    });

    const listResponse = await request(app).get('/api/locations').expect(200);
    expect(listResponse.body.locations).toHaveLength(1);
    expect(listResponse.body.locations[0].weather.condition).toBe('Cloudy');
  });

  it('rejects missing or out-of-range coordinates', async () => {
    await request(app)
      .post('/api/locations')
      .send({ latitude: 1.35 })
      .expect(422, { detail: 'latitude and longitude are required' });

    await request(app)
      .post('/api/locations')
      .send({ latitude: 1.6, longitude: 103.85 })
      .expect(422, {
        detail:
          'Coordinates must be within Singapore (lat 1.1-1.5, lon 103.6-104.1)',
      });

    expect(weatherClient.getCurrentWeather).not.toHaveBeenCalled();
  });

  it('rejects duplicate locations', async () => {
    const coordinates = { latitude: 1.35, longitude: 103.85 };

    await request(app).post('/api/locations').send(coordinates).expect(201);
    await request(app)
      .post('/api/locations')
      .send(coordinates)
      .expect(409, { detail: 'Location already exists' });

    expect(weatherClient.getCurrentWeather).toHaveBeenCalledTimes(1);
  });

  it('returns a location by id and reports missing locations', async () => {
    const created = await request(app)
      .post('/api/locations')
      .send({ latitude: 1.35, longitude: 103.85 })
      .expect(201);

    await request(app)
      .get(`/api/locations/${created.body.id}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          id: created.body.id,
          latitude: 1.35,
          longitude: 103.85,
          weather: { condition: 'Cloudy' },
        });
      });

    await request(app)
      .get('/api/locations/999')
      .expect(404, { detail: 'Location not found' });
  });

  it('deletes a location and returns not found for missing or invalid ids', async () => {
    const created = await request(app)
      .post('/api/locations')
      .send({ latitude: 1.35, longitude: 103.85 })
      .expect(201);

    await request(app).delete(`/api/locations/${created.body.id}`).expect(204);
    await request(app)
      .get(`/api/locations/${created.body.id}`)
      .expect(404, { detail: 'Location not found' });
    await request(app)
      .delete(`/api/locations/${created.body.id}`)
      .expect(404, { detail: 'Location not found' });
    await request(app)
      .delete('/api/locations/not-an-id')
      .expect(404, { detail: 'Location not found' });
  });

  it('refreshes weather for a saved location', async () => {
    const created = await request(app)
      .post('/api/locations')
      .send({ latitude: 1.35, longitude: 103.85 })
      .expect(201);

    const refreshedWeather = { ...weather, condition: 'Sunny' };
    weatherClient.getCurrentWeather.mockResolvedValue(refreshedWeather);

    await request(app)
      .post(`/api/locations/${created.body.id}/refresh`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.weather.condition).toBe('Sunny');
      });

    expect(weatherClient.getCurrentWeather).toHaveBeenLastCalledWith(
      1.35,
      103.85,
    );
  });

  it('returns not found when refreshing an unknown location', async () => {
    await request(app)
      .post('/api/locations/999/refresh')
      .expect(404, { detail: 'Location not found' });

    expect(weatherClient.getCurrentWeather).not.toHaveBeenCalled();
  });

  it('keeps a newly created location when its initial weather refresh fails', async () => {
    weatherClient.getCurrentWeather.mockRejectedValue(
      new WeatherProviderError('Weather service unavailable'),
    );

    const response = await request(app)
      .post('/api/locations')
      .send({ latitude: 1.35, longitude: 103.85 })
      .expect(201);

    expect(response.body.weather).toMatchObject({
      condition: 'Not refreshed',
      source: 'not-refreshed',
    });
  });

  it('returns a bad gateway response when weather refresh fails', async () => {
    const created = await request(app)
      .post('/api/locations')
      .send({ latitude: 1.35, longitude: 103.85 })
      .expect(201);
    weatherClient.getCurrentWeather.mockRejectedValue(
      new WeatherProviderError('Weather service unavailable'),
    );

    await request(app)
      .post(`/api/locations/${created.body.id}/refresh`)
      .expect(502, { detail: 'Weather service unavailable' });
  });
});

it('fails on purpose', () => {
  expect(true).toBe(false);
});
