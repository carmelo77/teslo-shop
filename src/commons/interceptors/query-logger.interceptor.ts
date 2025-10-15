import { Logger as NestLogger } from '@nestjs/common';
import { Logger as TypeOrmLogger, QueryRunner } from 'typeorm';

/**
 * Logger personalizado para TypeORM que intercepta todas las queries
 */
export class TypeOrmQueryLogger implements TypeOrmLogger {
  private readonly logger = new NestLogger('TypeORM');

  /**
   * Logs query and parameters used in it.
   */
  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    const sql = this.formatQuery(query, parameters);
    this.logger.log(sql);
  }

  /**
   * Logs query that is failed.
   */
  logQueryError(error: string | Error, query: string, parameters?: any[], queryRunner?: QueryRunner) {
    const sql = this.formatQuery(query, parameters);
    this.logger.error(`Query failed: ${sql}`);
    this.logger.error(error);
  }

  /**
   * Logs query that is slow.
   */
  logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner) {
    const sql = this.formatQuery(query, parameters);
    this.logger.warn(`Slow query (${time}ms): ${sql}`);
  }

  /**
   * Logs events from the schema build process.
   */
  logSchemaBuild(message: string, queryRunner?: QueryRunner) {
    this.logger.log(message);
  }

  /**
   * Logs events from the migrations run process.
   */
  logMigration(message: string, queryRunner?: QueryRunner) {
    this.logger.log(message);
  }

  /**
   * Perform logging using given logger, or by default to the console.
   */
  log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner) {
    switch (level) {
      case 'log':
      case 'info':
        this.logger.log(message);
        break;
      case 'warn':
        this.logger.warn(message);
        break;
    }
  }

  /**
   * Formatea la query reemplazando los placeholders con los parámetros
   */
  private formatQuery(query: string, parameters?: any[]): string {
    if (!parameters || parameters.length === 0) {
      return query;
    }

    let formattedQuery = query;
    parameters.forEach((param, index) => {
      const value = typeof param === 'string' ? `'${param}'` : param;
      formattedQuery = formattedQuery.replace(`$${index + 1}`, String(value));
    });

    return formattedQuery;
  }
}
