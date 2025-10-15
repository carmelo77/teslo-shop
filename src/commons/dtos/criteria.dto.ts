import { PaginationDto } from './pagination.dto';

export type SortOrder = 'asc' | 'desc' | 'ASC' | 'DESC';

/**
 * DTO para filtros dinámicos
 * Parseado desde el formato: filter[key]=value
 * Ejemplo: filter[stock]=10 → { stock: 10 }
 */
export class FilterDto {
  [key: string]: string;
}

/**
 * DTO para ordenamiento dinámico
 * Parseado desde el formato: sort[key]=asc|desc
 * Ejemplo: sort[price]=asc → { price: 'asc' }
 */
export class SortDto {
  [key: string]: SortOrder;
}

/**
 * DTO completo para criterios de búsqueda, filtrado, ordenamiento y paginación
 *
 * Nota: Este DTO es parseado automáticamente por ParseCriteriaPipe
 */
export class CriteriaDto extends PaginationDto {
  /**
   * Filtros dinámicos aplicados a la consulta
   */
  filter?: FilterDto;

  /**
   * Ordenamiento aplicado a la consulta
   */
  sort?: SortDto;
}