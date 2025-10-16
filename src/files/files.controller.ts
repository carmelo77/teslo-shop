import { BadRequestException, Controller, Get, Param, ParseUUIDPipe, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { FileFilter } from './helpers/file-filter.helper';
import { FilesService } from './files.service';
// import { diskStorage } from 'multer';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product/:productId')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: FileFilter,
    // limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
    // storage: diskStorage({ destination: './static/uploads' })
  })) // file es el nombre del archivo desde el frontend
  async uploadFile(
    @Param('productId', ParseUUIDPipe) productId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return await this.filesService.uploadProductImage(file, productId);
  }

  @Get('product/:fileName')
  async getFileUrl(@Param('fileName') fileName: string) {
    return await this.filesService.getFileUrl(fileName);
  }
  
}
