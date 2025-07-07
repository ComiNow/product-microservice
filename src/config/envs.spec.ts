import * as Joi from 'joi';

jest.mock('dotenv/config', () => {});

describe('envs config', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should export envs with valid environment variables', () => {
    process.env.PORT = '3001';
    process.env.DATABASE_URL = 'file:./dev.db';
    process.env.NATS_SERVERS = 'nats://localhost:4222,nats://localhost:4223';

    const { envs } = require('./envs');

    expect(envs.port).toBe(3001);
    expect(envs.databaseUrl).toBe('file:./dev.db');
    expect(envs.natsServers).toEqual([
      'nats://localhost:4222',
      'nats://localhost:4223',
    ]);
  });

  it('should throw error if required env vars are missing', () => {
    process.env.PORT = undefined as any;
    process.env.DATABASE_URL = undefined as any;
    process.env.NATS_SERVERS = undefined as any;

    jest.resetModules();
    expect(() => require('./envs')).toThrow(/Config validation error/);
  });

  it('should throw error if NATS_SERVERS is not a comma separated string', () => {
    process.env.PORT = '3001';
    process.env.DATABASE_URL = 'file:./dev.db';
    process.env.NATS_SERVERS = '';

    jest.resetModules();
    expect(() => require('./envs')).toThrow(/Config validation error/);
  });
});
