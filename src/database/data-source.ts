import { DataSource } from 'typeorm';
import { standaloneDataSourceOptions } from '../config/database.config';

/**
 * DataSource para ejecutar migraciones desde TypeORM CLI
 * Usa la configuración centralizada de database.config.ts
 */
const dataSource = new DataSource({
  ...standaloneDataSourceOptions,
  
  // Entidades (para que TypeORM las conozca al generar migraciones)
  entities: ['src/**/*.entity.ts'],
  
  // Directorio de migraciones
  migrations: ['src/database/migrations/*.ts'],
  
  // Configuración adicional para migraciones
  logging: ['error', 'warn', 'migration'],
  migrationsTableName: 'migrations',
});

export default dataSource;
