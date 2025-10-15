import { IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

import { ProductsGenderEnum } from "../enum/products-gender.enum";

export class CreateProductDto {
    
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @IsString({ each: true })
    @IsArray()
    sizes: string[];

    @IsEnum(ProductsGenderEnum)
    @IsNotEmpty()
    gender: ProductsGenderEnum;

    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    tags?: string[]

    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    images?: string[]
}