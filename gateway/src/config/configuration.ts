export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '8080', 10),
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_DATABASE || 'finance_gateway',
  },
  coreEngine: {
    url: process.env.CORE_ENGINE_URL || 'http://localhost:9090',
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'default-dev-key-32-chars-long!!',
    jwtSecret: process.env.JWT_SECRET || 'dev-jwt-secret',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD || '',
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  },
  storage: {
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    },
  },
  security: {
    ipWhitelist: process.env.IP_WHITELIST || '',
    ipBlacklist: process.env.IP_BLACKLIST || '',
    enableRequestValidation: process.env.ENABLE_REQUEST_VALIDATION !== 'false',
    maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5', 10),
    loginLockoutMinutes: parseInt(process.env.LOGIN_LOCKOUT_MINUTES || '15', 10),
    sessionTimeoutMinutes: parseInt(process.env.SESSION_TIMEOUT_MINUTES || '60', 10),
    mfaRequired: process.env.MFA_REQUIRED === 'true',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '30', 10),
  },
  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','),
  },
  flutterwave: {
    publicKey: process.env.FLW_PUBLIC_KEY || '',
    secretKey: process.env.FLW_SECRET_KEY || '',
    webhookSecret: process.env.FLW_WEBHOOK_SECRET || '',
  },
  interswitch: {
    clientId: process.env.INTERSWITCH_CLIENT_ID || '',
    clientSecret: process.env.INTERSWITCH_CLIENT_SECRET || '',
    terminalId: process.env.INTERSWITCH_TERMINAL_ID || '',
    baseUrl: process.env.INTERSWITCH_BASE_URL || 'https://api.interswitchgroup.com',
  },
  compliance: {
    provider: process.env.COMPLIANCE_PROVIDER || 'internal',
    apiKey: process.env.COMPLIANCE_API_KEY || '',
  },
  kyc: {
    provider: process.env.KYC_PROVIDER || 'internal',
    bvnSecret: process.env.BVN_SECRET_KEY || '',
    dojahAppId: process.env.DOJAH_APP_ID || '',
    dojahApiKey: process.env.DOJAH_API_KEY || '',
  },
  queue: {
    defaultConcurrency: parseInt(process.env.QUEUE_CONCURRENCY || '10', 10),
    maxRetries: parseInt(process.env.QUEUE_MAX_RETRIES || '3', 10),
  },
});
