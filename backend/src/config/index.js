import dotenv from 'dotenv';
dotenv.config();

// Security check: Ensure JWT secrets are set in production
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be set and at least 32 characters in production');
  }
  if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be set and at least 32 characters in production');
  }
}

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/electra',
  jwtSecret: process.env.JWT_SECRET || 'electra-super-secret-jwt-key-2024',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'electra-refresh-secret-key-2024',
  jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  smtpEmail: process.env.SMTP_EMAIL || 'test@gmail.com',
  smtpPassword: process.env.SMTP_PASSWORD || 'testpass',
  smtpService: process.env.SMTP_SERVICE || 'gmail'
};

export default config;