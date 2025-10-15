import { Injectable } from '@nestjs/common';

import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService,

  ){}
  
  async runSeed() {
    await this.inserProducts();
  }

  private async inserProducts() {
    const products = initialData.products;

    const insertPromises: Promise<Product>[] = [];

    products.forEach( (product) => {
      insertPromises.push(this.productsService.create(product))
    });

    await Promise.all(insertPromises);

    return true;
  }
}
