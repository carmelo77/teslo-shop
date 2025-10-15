import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsModule } from './products/products.module';
import { CommonsModule } from './commons/commons.module';
import { CategoriesModule } from './categories/categories.module';
import { TypeOrmQueryLogger } from './commons/interceptors/query-logger.interceptor';
import { SeedModule } from './seed/seed.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      ...databaseConfig,
      logger: new TypeOrmQueryLogger()
    }),
    ProductsModule,
    CommonsModule,
    CategoriesModule,
    SeedModule
  ],
})
export class AppModule {}
