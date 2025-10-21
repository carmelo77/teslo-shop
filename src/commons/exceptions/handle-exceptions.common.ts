import { QueryFailedError } from 'typeorm';
import { BadRequestException, InternalServerErrorException } from "@nestjs/common";

export const handleExceptions = (error: unknown) => {
    if (error instanceof QueryFailedError && error.driverError?.code === '23505') {
        const field = error.driverError.detail?.match(/Key \((.+?)\)/)?.[1] || 'specified field';
        throw new BadRequestException(`The value for '${field}' already exists`);
    }

    throw new InternalServerErrorException('Internal server error');
}