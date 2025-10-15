import { DataSourceOptions } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';

// Cargar variables de entorno
config();

/**
 * Configuración centralizada de base de datos
 * Se usa en:
 * - app.module.ts (runtime de NestJS)
 * - data-source.ts (CLI de TypeORM para migraciones)
 * - run-seeder.ts (script standalone de seeders)
 */

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT!,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  autoLoadEntities: true,
  synchronize: true,
  logging: true,
};

/**
 * Configuración para scripts standalone (seeders, migrations)
 * Usa las mismas variables pero con paths diferentes para las entidades
 */
export const standaloneDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT!,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  entities: ['dist/**/*.entity.js'], // Para scripts compilados
  synchronize: false, // NUNCA true en scripts standalone
  logging: ['error', 'warn'],
};
