import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';

import { PaginationDto } from '../dtos/pagination.dto';
import { PaginationResponse } from '../interfaces/pagination.interface';

@Injectable()
export class PaginationService {
  /**
   * Ejecuta la query con paginación y retorna la respuesta formateada
   */
  async paginate<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    criteria: PaginationDto
  ): Promise<PaginationResponse<T>> {
    const { limit, offset } = criteria;

    // Aplicar paginación solo si se especificó
    if (limit !== undefined) {
      queryBuilder = queryBuilder.take(limit);
    }
    if (offset !== undefined) {
      queryBuilder = queryBuilder.skip(offset);
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return this.buildResponse(data, total, criteria);
  }

  /**
   * Construye la respuesta de paginación
   */
  private buildResponse<T>(
    data: T[],
    total: number,
    criteria: PaginationDto
  ): PaginationResponse<T> {
    const { limit, offset } = criteria;

    // Si no hay paginación, retornar solo con total
    if (limit === undefined && offset === undefined) {
      return {
        data,
        metadata: {
          total,
        },
      };
    }

    // Si hay paginación, calcular metadata completa
    const currentPage = Math.floor((offset ?? 0) / (limit ?? 1)) + 1;
    const totalPages = Math.ceil(total / (limit ?? 1));

    return {
      data,
      metadata: {
        total,
        page: currentPage,
        limit: limit!,
        offset: offset!,
        totalPages,
      },
    };
  }
}
