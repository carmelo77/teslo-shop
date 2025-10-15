import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

import { CriteriaDto } from '../dtos/criteria.dto';

/**
 * Pipe para parsear query parameters en formato:
 * - pagination[limit]=10
 * - pagination[offset]=0
 * - filter[key]=value
 * - sort[key]=asc|desc
 */
@Injectable()
export class ParseCriteriaPipe implements PipeTransform {
  private static readonly DEFAULT_LIMIT = 10;
  private static readonly DEFAULT_OFFSET = 0;
  private static readonly MAX_LIMIT = 100;
  
  private static readonly VALID_SORT_VALUES = ['asc', 'desc', 'ASC', 'DESC'] as const;

  transform(query: Record<string, any>): CriteriaDto {
    const criteriaDto: CriteriaDto = {} as CriteriaDto;

    // Parsear pagination (si no se envía, no se usa paginación por defecto)
    this.parsePagination(query, criteriaDto);

    // Parsear filters
    const filters = this.parseFilters(query);
    if (filters) {
      criteriaDto.filter = filters;
    }

    // Parsear sorts
    const sorts = this.parseSorts(query);
    if (sorts) {
      criteriaDto.sort = sorts;
    }

    return criteriaDto;
  }

  /**
   * Parsea los parámetros de paginación
   * Si no se envían parámetros, no se agregan valores por defecto
   */
  private parsePagination(query: Record<string, any>, criteriaDto: CriteriaDto): void {
    let hasLimit = false;
    let hasOffset = false;

    for (const [key, value] of Object.entries(query)) {
      if (!this.isPaginationKey(key)) {
        continue;
      }

      const paginationField = this.extractBracketValue(key);
      
      if (paginationField === 'limit') {
        criteriaDto.limit = this.parseLimit(value);
        hasLimit = true;
      } else if (paginationField === 'offset') {
        criteriaDto.offset = this.parseOffset(value);
        hasOffset = true;
      }
    }

    // Si se envió limit pero no offset, usar offset 0
    if (hasLimit && !hasOffset) {
      criteriaDto.offset = ParseCriteriaPipe.DEFAULT_OFFSET;
    }

    // Si se envió offset pero no limit, usar limit por defecto
    if (hasOffset && !hasLimit) {
      criteriaDto.limit = ParseCriteriaPipe.DEFAULT_LIMIT;
    }
  }

  /**
   * Parsea los filtros del query
   */
  private parseFilters(query: Record<string, any>): Record<string, string> | null {
    const filters: Record<string, string> = {};

    for (const [key, value] of Object.entries(query)) {
      if (!this.isFilterKey(key)) continue;
      
      const filterName = this.extractBracketValue(key);
      if (!filterName || typeof value !== 'string') continue;
      
      filters[filterName] = value;
    }

    return filters || null;
  }

  /**
   * Parsea los ordenamientos del query
   */
  private parseSorts(query: Record<string, any>): Record<string, 'asc' | 'desc' | 'ASC' | 'DESC'> | null {
    const sorts: Record<string, 'asc' | 'desc' | 'ASC' | 'DESC'> = {};

    for (const [key, value] of Object.entries(query)) {
      if (!this.isSortKey(key)) continue;
      
      const sortName = this.extractBracketValue(key);
      if (!sortName || !this.isValidSortValue(value)) continue;
      
      sorts[sortName] = value as 'asc' | 'desc' | 'ASC' | 'DESC';
    }

    return sorts || null;
  }

  /**
   * Verifica si una key es de paginación
   */
  private isPaginationKey(key: string): boolean {
    return key.startsWith('pagination[') && key.endsWith(']');
  }

  /**
   * Verifica si una key es de filtro
   */
  private isFilterKey(key: string): boolean {
    return key.startsWith('filter[') && key.endsWith(']');
  }

  /**
   * Verifica si una key es de ordenamiento
   */
  private isSortKey(key: string): boolean {
    return key.startsWith('sort[') && key.endsWith(']');
  }

  /**
   * Extrae el valor entre corchetes de una key
   * Ejemplo: "filter[value]" -> "value"
   */
  private extractBracketValue(key: string): string {
    const match = key.match(/\[([^\]]+)\]/);
    return match ? match[1] : '';
  }

  /**
   * Parsea y valida el valor de limit
   */
  private parseLimit(value: any): number {
    const limit = this.parsePositiveInteger(value, 'limit');
    
    if (limit > ParseCriteriaPipe.MAX_LIMIT) {
      throw new BadRequestException(
        `limit cannot exceed ${ParseCriteriaPipe.MAX_LIMIT}`
      );
    }

    return limit;
  }

  /**
   * Parsea y valida el valor de offset
   */
  private parseOffset(value: any): number {
    const offset = parseInt(value, 10);

    if (isNaN(offset) || offset < 0) {
      throw new BadRequestException('offset must be a non-negative number');
    }

    return offset;
  }

  /**
   * Parsea un entero positivo
   */
  private parsePositiveInteger(value: any, fieldName: string): number {
    const num = parseInt(value, 10);

    if (isNaN(num) || num <= 0) {
      throw new BadRequestException(`${fieldName} must be a positive number`);
    }

    return num;
  }

  /**
   * Verifica si un valor es un orden de sort válido
   */
  private isValidSortValue(value: any): value is 'asc' | 'desc' | 'ASC' | 'DESC' {
    return typeof value === 'string' && 
           ParseCriteriaPipe.VALID_SORT_VALUES.includes(value as any);
  }
}
