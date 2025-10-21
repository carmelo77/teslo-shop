import { Repository, DataSource } from 'typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { validate as isUUID } from 'uuid'

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { handleExceptions } from '../commons/exceptions/handle-exceptions.common';
import { PaginationService } from '../commons/services/pagination.service';
import { CriteriaService } from '../commons/services/criteria.service';
import { CriteriaDto } from '../commons/dtos/criteria.dto';
import { ProductImage } from './entities/product-image.entity';
import { QueryBuilder } from 'typeorm/browser';
import { SelectQueryBuilder } from 'typeorm/browser';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly paginationService: PaginationService,
    private readonly criteriaService: CriteriaService,
    private readonly dataSource: DataSource
  ) {}

  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...rest } = createProductDto;

      const product = this.repository.create({
        ...rest,
        user,
        images: images.map(image => this.productImageRepository.create({ url: image }))
      });

      await this.repository.save(product);

      return product;

    } catch (error) {
      this.logger.error(error);
      return handleExceptions(error);
    }
    
  }

  async findAll(criteriaDto: CriteriaDto) {
    const { filter, sort } = criteriaDto;

    let queryBuilder = this.repository.createQueryBuilder('i');

    // Aplicar búsqueda si existe
    queryBuilder = this.criteriaService.search(queryBuilder, filter?.search, {
      partialMatch: true,
      attributesDB: [
        { name: 'i.title' },
        { name: 'i.slug' },
        { name: 'i.sizes', isArray: true }
      ]
    });

    this.loadRelations(queryBuilder);

    // Aplicar filtros
    queryBuilder = this.criteriaService.filter(queryBuilder, 'i.gender', '=', filter?.gender);
    queryBuilder = this.criteriaService.filter(queryBuilder, 'i.stock', '>=', filter?.stock);

    // Aplicar ordenamiento
    queryBuilder = this.criteriaService.sort(queryBuilder, sort);

    // Ejecutar query con paginación
    return this.paginationService.paginate(queryBuilder, criteriaDto);
  }

  async findOne(term: string) {
    let product: Product | null;
    const queryBuilder = this.repository.createQueryBuilder('i');

    if ( isUUID(term) ) {
      queryBuilder.where('i.id = :term', { term });
    } else {
      queryBuilder.where('UPPER(i.title) = :term', { term: term.toUpperCase() });
      queryBuilder.orWhere('LOWER(i.slug) = :term', { term: term.toLowerCase() });
    }

    product = await queryBuilder.getOne();

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User): Promise<Product> {

    const { images, ...rest } = updateProductDto;

    const product = await this.repository.preload({
      id,
      ...rest,
      user
    });

    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }

    // Create Query Runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      if ( images ) {
        await queryRunner.manager.delete(ProductImage, { product: id });

        product.images = images.map(img => this.productImageRepository.create({ url: img }));
      }

      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return product;
    } catch (error) {

      this.logger.error(error);

      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      
      return handleExceptions(error);
    }
  }

  async remove(id: string) {
    try {
      await this.findOne(id);

      return await this.repository.delete(id);
    } catch (error) {
      this.logger.error(error);
      return handleExceptions(error);
    }
  }

  async deleteAllProducts() {
    try {
      const query = this.repository.createQueryBuilder('product').delete().where({});
      await query.execute();
      return { message: 'All products have been deleted' };
    } catch (error) {
      this.logger.error(error);
      return handleExceptions(error);
    }
  }

  loadRelations(queryBuilder: SelectQueryBuilder<Product>) {
    void queryBuilder.leftJoinAndSelect('i.images', 'image');
    void queryBuilder.leftJoinAndSelect('i.category', 'category');
  }
}
