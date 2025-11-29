import { config } from 'dotenv';
config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  db: {
    host: process.env.POSTGRES_HOST || 'postgres',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'authdb',
  },
  authServiceUrl: process.env.AUTH_SERVICE_URL!,
  jwt: {
    privateKeyPath:
      process.env.JWT_PRIVATE_KEY_PATH || './config/keys/jwt_private.pem',
    publicKeyPath:
      process.env.JWT_PUBLIC_KEY_PATH || './config/keys/jwt_public.pem',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  rabbitmq: process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672',
};
