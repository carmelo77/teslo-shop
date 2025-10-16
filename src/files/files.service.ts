import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MinioService } from './minio.service';
import { Product } from '../products/entities/product.entity';
import { ProductImage } from '../products/entities/product-image.entity';

@Injectable()
export class FilesService {
  constructor(
    private readonly minioService: MinioService,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
  ) {}

  async uploadProductImage(file: Express.Multer.File, productId: string) {
    // Verificar que el producto existe
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    // Subir archivo a MinIO
    const fileName = await this.minioService.uploadFile(file);
    const fileUrl = await this.minioService.getFileUrl(fileName);
    
    // Guardar referencia en la base de datos
    const productImage = this.productImageRepository.create({
      url: fileName,
      product,
    });
    
    await this.productImageRepository.save(productImage);
    
    return {
      id: productImage.id,
      fileName,
      fileUrl,
      productId: product.id,
    };
  }

  async getFileUrl(fileName: string) {
    return await this.minioService.getFileUrl(fileName);
  }

  async deleteFile(fileName: string) {
    return await this.minioService.deleteFile(fileName);
  }
}
