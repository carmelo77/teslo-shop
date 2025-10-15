import { DataSource } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { ProductImage } from '../../products/entities/product-image.entity';
import { initialData } from '../../seed/data/seed-data';

export class ProductsSeeder {
  
  public async run(dataSource: DataSource): Promise<void> {
    const productRepository = dataSource.getRepository(Product);
    const productImageRepository = dataSource.getRepository(ProductImage);

    // Limpiar datos existentes
    console.log('🗑️  Limpiando productos existentes...');
    await productImageRepository.delete({});
    await productRepository.delete({});

    console.log('🌱 Insertando productos desde seed-data...');
    
    const products = initialData.products;
    let count = 0;

    for (const productData of products) {
      const { images = [], ...productDetails } = productData;

      // Crear el producto con sus imágenes
      const product = productRepository.create({
        ...productDetails,
        images: images.map(imageUrl => 
          productImageRepository.create({ url: imageUrl })
        ),
      });

      await productRepository.save(product);
      count++;
      
      // Mostrar progreso cada 10 productos
      if (count % 10 === 0) {
        console.log(`   ✓ ${count} productos insertados...`);
      }
    }

    console.log(`✅ ${count} productos insertados exitosamente!`);
  }
}
