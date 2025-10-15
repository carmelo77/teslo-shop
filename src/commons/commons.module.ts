import { Module } from '@nestjs/common';
import { PaginationService } from './services/pagination.service';
import { CriteriaService } from './services/criteria.service';

@Module({
  providers: [PaginationService, CriteriaService],
  exports: [PaginationService, CriteriaService]
})
export class CommonsModule {}