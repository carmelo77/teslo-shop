import { DataSource } from 'typeorm';
import { ProductsSeeder } from './products.seeder';

/**
 * Seeder principal que orquesta todos los seeders
 * Se ejecuta secuencialmente para mantener integridad referencial
 */
export class MainSeeder {
  
  public async run(dataSource: DataSource): Promise<void> {
    console.log('\n🌱 Iniciando proceso de seeding...\n');

    try {
      // Ejecutar seeder de productos
      const productsSeeder = new ProductsSeeder();
      await productsSeeder.run(dataSource);

      // Aquí podrías agregar más seeders en el futuro:
      // const categoriesSeeder = new CategoriesSeeder();
      // await categoriesSeeder.run(dataSource);

      console.log('\n✅ Proceso de seeding completado exitosamente!\n');
    } catch (error) {
      console.error('\n❌ Error durante el proceso de seeding:');
      console.error(error);
      throw error;
    }
  }
}
