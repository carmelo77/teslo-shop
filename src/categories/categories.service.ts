import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { handleExceptions } from '../commons/exceptions/handle-exceptions.common';
import { CriteriaDto } from '../commons/dtos/criteria.dto';
import { PaginationService } from '../commons/services/pagination.service';
import { CriteriaService } from '../commons/services/criteria.service';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly paginationService: PaginationService,
    private readonly criteriaService: CriteriaService
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const category = this.categoryRepository.create(createCategoryDto);
      return await this.categoryRepository.save(category);
    } catch (error) {
      this.logger.error(error);
      return handleExceptions(error);
    }
  }

  async findAll(criteriaDto: CriteriaDto) {
    const { filter, sort } = criteriaDto;

    let queryBuilder = this.categoryRepository.createQueryBuilder('i');

    queryBuilder = this.criteriaService.search(queryBuilder, filter?.search, {
      partialMatch: true,
      attributesDB: [{ name: 'i.name' }]
    });

    queryBuilder = this.criteriaService.sort(queryBuilder, sort);

    return this.paginationService.paginate(queryBuilder, criteriaDto);
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOneBy({ id });
    
    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.preload({
      id,
      ...updateCategoryDto
    });

    if (!category) {
      throw new NotFoundException(`Category with id "${id}" not found`);
    }

    try {
      return await this.categoryRepository.save(category);
    } catch (error) {
      this.logger.error(error);
      return handleExceptions(error);
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id);
      return await this.categoryRepository.delete(id);
    } catch (error) {
      this.logger.error(error);
      return handleExceptions(error);
    }
  }
}
