import { BadRequestException } from '@nestjs/common';

export const FileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {
    if (!file.mimetype.split('/')[1].match(/jpg|jpeg|png|webp/)) {
        return callback(new BadRequestException('Only image files are allowed! (jpg, jpeg, png, webp)'), false);
    }
    callback(null, true);
}