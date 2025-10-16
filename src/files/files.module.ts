import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MinioService } from './minio.service';
import { Product } from '../products/entities/product.entity';
import { ProductImage } from '../products/entities/product-image.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Product, ProductImage]),
  ],
  controllers: [FilesController],
  providers: [FilesService, MinioService],
})
export class FilesModule {}
