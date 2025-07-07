// No importar el módulo hasta que se establezcan las variables de entorno
describe('envs config', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    // Limpiar mocks para esta prueba específica
    jest.unmock('./envs');
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should export envs with valid environment variables', () => {
    process.env.PORT = '3000';
    process.env.NATS_SERVICE_NAME = 'NATS_SERVICE';
    process.env.NATS_SERVERS = 'nats://localhost:4222';

    const { envs } = require('./envs');

    expect(envs.port).toBe(3000);
    expect(envs.natsServiceName).toBe('NATS_SERVICE');
    expect(envs.natsServers).toEqual(['nats://localhost:4222']);
  });

  it('should throw error if required env vars are missing', () => {
    delete process.env.PORT;
    delete process.env.NATS_SERVICE_NAME;
    delete process.env.NATS_SERVERS;

    expect(() => require('./envs')).toThrow(/Config validation error/);
  });

  it('should throw error if NATS_SERVERS is not a comma separated string', () => {
    process.env.PORT = '3000';
    process.env.NATS_SERVICE_NAME = 'NATS_SERVICE';
    process.env.NATS_SERVERS = '';

    expect(() => require('./envs')).toThrow(/Config validation error/);
  });
});
