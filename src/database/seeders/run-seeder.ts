import { DataSource } from 'typeorm';
import { MainSeeder } from './main.seeder';
import { standaloneDataSourceOptions } from '../../config/database.config';

/**
 * Script standalone para ejecutar los seeders
 * 
 * Uso:
 *   npm run seed
 * 
 * Este script:
 * 1. Crea una conexión directa a la base de datos
 * 2. Ejecuta todos los seeders en orden
 * 3. Cierra la conexión al finalizar
 */

const runSeeder = async () => {
  console.log('🔌 Conectando a la base de datos...');

  // Usa la configuración centralizada
  const dataSource = new DataSource(standaloneDataSourceOptions);

  try {
    await dataSource.initialize();
    console.log('✅ Conexión establecida\n');

    // Ejecutar el seeder principal
    const mainSeeder = new MainSeeder();
    await mainSeeder.run(dataSource);

  } catch (error) {
    console.error('❌ Error ejecutando seeder:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('🔌 Conexión cerrada');
  }
};

// Ejecutar el seeder
runSeeder();
