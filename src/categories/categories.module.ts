import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { Category } from './entities/category.entity';
import { CommonsModule } from '../commons/commons.module';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
  imports: [
    TypeOrmModule.forFeature([Category]),
    CommonsModule
  ],
  exports: [CategoriesService]
})
export class CategoriesModule {}
