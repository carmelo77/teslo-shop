import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder, Brackets, ObjectLiteral } from 'typeorm';

interface SearchConfig {
  name: string;
  setWeight?: string;
  coalesce?: boolean;
  isArray?: boolean;
}

@Injectable()
export class CriteriaService {
  /**
   * Applies search with configurable fields
   */
  search<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    searchTerm: string | undefined,
    config: {
      partialMatch?: boolean;
      attributesDB: SearchConfig[];
    }
  ): SelectQueryBuilder<T> {
    if (!searchTerm || !config.attributesDB || config.attributesDB.length === 0) {
      return qb;
    }

    const partialMatch = config.partialMatch !== false;

    qb.andWhere(new Brackets(subQb => {
      config.attributesDB.forEach((attr, index) => {

        const searchValue = attr.isArray 
          ? searchTerm.toLowerCase()
          : (partialMatch ? `%${searchTerm}%` : searchTerm);

        const condition = attr.isArray 
          ? `LOWER(:searchTerm${index}) = ANY(ARRAY(SELECT LOWER(unnest(${attr.name}))))`
          : `${attr.name} ILIKE :searchTerm${index}`;
        
        if (index === 0) {
          subQb.where(condition, { [`searchTerm${index}`]: searchValue });
        } else {
          subQb.orWhere(condition, { [`searchTerm${index}`]: searchValue });
        }
      });
    }));

    return qb;
  }

  /**
   * Applies exact match filter
   */
  filter<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    attribute: string,
    operator: '=' | '<>' | '>' | '<' | '>=' | '<=' = '=',
    value?: string
  ): SelectQueryBuilder<T> {
    if (value === undefined || value === null) return qb;
    
    const paramName = attribute.replaceAll('.', '_');
    
    qb.andWhere(`${attribute} ${operator} :${paramName}`, { 
      [paramName]: value
    });
    
    return qb;
  }

  /**
   * Applies IS NULL / IS NOT NULL filter based on filter value
   * If the filter value is truthy, applies the IS condition
   * Supports boolean attributes (converts string to boolean)
   */
  is<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    attribute: string,
    value: string,
    operator: 'IS NULL' | 'IS NOT NULL',
    options: {
      isBoolean?: boolean;
      dbAttribute?: string;
      alias?: string;
    } = {}
  ): SelectQueryBuilder<T> {
    const { isBoolean = false, dbAttribute, alias = 'i' } = options;
    
    if (value == null) return qb;

    const field = `${alias}.${dbAttribute || attribute}`;
    
    if (isBoolean) {
      const boolValue = Boolean(value);
      
      qb.andWhere(`${field} = :${attribute}Value`, { 
        [`${attribute}Value`]: boolValue 
      });
    } else {
      qb.andWhere(`${field} ${operator}`);
    }

    return qb;
  }
  /**
   * Applies sort to QueryBuilder
   */
  sort<T extends ObjectLiteral>(
    qb: SelectQueryBuilder<T>,
    sort?: Record<string, 'asc' | 'desc' | 'ASC' | 'DESC'>
  ): SelectQueryBuilder<T> {
    if (!sort) return qb;

    Object.entries(sort).forEach(([key, value]) => {
      if (value) {
        // Si la key ya incluye un punto, usarla tal cual, sino agregar alias
        const fieldName = key.includes('.') ? key : `i.${key}`;
        qb.addOrderBy(fieldName, value.toUpperCase() as 'ASC' | 'DESC');
      }
    });

    return qb;
  }

}
