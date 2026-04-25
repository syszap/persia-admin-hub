import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',

  jwt: {
    secret: process.env.JWT_SECRET ?? 'changeme-use-a-long-random-secret-in-production',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES ?? '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'changeme-refresh-secret',
  },

  cors: {
    allowedOrigins: [
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:3000',
      process.env.FRONTEND_URL,
    ].filter((o): o is string => Boolean(o)),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10),
    authMax: parseInt(process.env.RATE_LIMIT_AUTH_MAX ?? '10', 10),
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10),
  },

  tenant: {
    enabled: process.env.MULTI_TENANT === 'true',
    defaultTenantId: process.env.DEFAULT_TENANT_ID ?? 'default',
  },
};
