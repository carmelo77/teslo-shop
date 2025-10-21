import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { Product } from '../products/entities/product.entity';
import { User } from '../auth/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {

  constructor(
    @InjectRepository( User )
    private readonly userRepository: Repository<User>,

    private readonly productsService: ProductsService

  ){}
  
  async runSeed() {
    await this.deleteTables();
    const adminUser = await this.insertUsers();
    await this.inserProducts(adminUser);
  }

  private async deleteTables() {
    await this.productsService.deleteAllProducts();
    await this.userRepository.delete({});
  }

  private async insertUsers(): Promise<User> {
    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach( (user) => {
      user.password = bcrypt.hashSync(user.password, 10);
      users.push(this.userRepository.create(user))
    })

    const dbUsers = await this.userRepository.save(users);

    return dbUsers[0];
  }

  private async inserProducts(adminUser: User): Promise<boolean> {
    const products = initialData.products;

    const insertPromises: Promise<Product>[] = [];

    products.forEach( (product) => {
      insertPromises.push(this.productsService.create(product, adminUser))
    });

    await Promise.all(insertPromises);

    return true;
  }
}
