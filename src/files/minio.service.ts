import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('MINIO_BUCKET') || 'teslo-products';
    
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT') || 'localhost',
      port: parseInt(this.configService.get<string>('MINIO_PORT') || '9000'),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ROOT_USER') || 'minioadmin',
      secretKey: this.configService.get<string>('MINIO_ROOT_PASSWORD') || 'minioadmin123',
    });

    this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Bucket '${this.bucketName}' created successfully`);
      }
    } catch (error) {
      this.logger.error('Error creating bucket:', error);
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      const fileExtension = file.mimetype.split('/')[1];
      const fileName = `${uuid()}.${fileExtension}`;
      
      await this.minioClient.putObject(
        this.bucketName,
        fileName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        }
      );

      return fileName;
    } catch (error) {
      throw new InternalServerErrorException('Error uploading file to MinIO');
    }
  }

  async getFileUrl(fileName: string): Promise<string> {
    try {
      // Verificar si el archivo existe en MinIO
      await this.minioClient.statObject(this.bucketName, fileName);
      
      return await this.minioClient.presignedGetObject(this.bucketName, fileName, 24 * 60 * 60);
    } catch (error) {
      if (error.code === 'NotFound') {
        throw new BadRequestException('File not found in storage');
      }
      throw new InternalServerErrorException('Error getting file URL');
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, fileName);
    } catch (error) {
      throw new InternalServerErrorException('Error deleting file from MinIO');
    }
  }
}
