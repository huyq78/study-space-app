export interface DBConfiguration {
  dbName: string;
  uri: string;
  dbUser: string;
  dbPazz: string;
  enableMigration: boolean;
  migrationCollection?: string;
  seedFolder?: string;
  migrationFolder?: string;
}

export interface JwtConfiguration {
  jwtLifetime: number;
  jwtLifetimeActivation: number;
  jwtLifetimeForgotPassword: number;
  jwtLifetimeAccessToken: number;
  jwtLifetimeRefreshToken: number;
  jwtSec: string;
}

export interface AppConfiguration {
  url: string;
}

export interface Configuration {
  port: number;
  jwt: JwtConfiguration;
  database: DBConfiguration;
  app: AppConfiguration;
}

export default (): Configuration => ({
  port: parseInt(process.env.PORT, 10) || 8888,
  jwt: {
    jwtLifetime: parseInt(process.env.TOKEN_LIFE_TIME, 10) || 15 * 60, // in second
    jwtLifetimeActivation: parseInt(process.env.TOKEN_LIFE_TIME_ACTIVATION, 10) || 3 * 60, // in second
    jwtLifetimeForgotPassword: parseInt(process.env.TOKEN_LIFE_TIME_FORGOT_PASSWORD, 10) || 15 * 60, // in second
    jwtLifetimeAccessToken: parseInt(process.env.TOKEN_LIFE_TIME_ACCESS_TOKEN, 10) || 10 * 60, // 10 minute
    jwtLifetimeRefreshToken: parseInt(process.env.TOKEN_LIFE_TIME_REFRESH_TOKEN, 10) || 24 * 60 * 60, // 1 day
    jwtSec: process.env.TOKEN_SEC || 'changeMe_please',
  },
  database: {
    dbName: process.env.DB_NAME || '',
    uri: process.env.DB_URI || '',
    dbUser: process.env.DB_USER || '',
    dbPazz: process.env.DB_PAZZ || '',
    enableMigration: !!process.env.ENABLE_MIGRATION || true,
    migrationCollection: 'migration_histories',
    seedFolder: 'db/seed',
    migrationFolder: 'db/migration',
  },
  app: {
    url: process.env.FRONT_BASE_URL || 'http://localhost:3000',
  }
});
