import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

import { ProductsGenderEnum } from "../enum/products-gender.enum";
import { Category } from "../../categories/entities/category.entity";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";

@Entity({ name: 'products' })
export class Product {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', { unique: true })
    title: string;

    @Column('float', { default: 0 })
    price: number;

    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @Column('text', { unique: true })
    slug: string;

    @Column('int', { default: 0 })
    stock: number;

    @Column('text', { array: true })
    sizes: string[];

    @Column('enum', { enum: ProductsGenderEnum, default: ProductsGenderEnum.UNISEX })
    gender: ProductsGenderEnum;

    @Column('text', { array: true, default: [] })
    tags: string[];

    @ManyToOne(
        () => Category,
        (category) => category.products,
        { eager: false }
    )
    category: Category;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // images
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true }
    )
    images?: ProductImage[]

    @ManyToOne( 
        () => User,
        (user) => user.product,
        { eager: false }
    )
    user: User;

    @BeforeInsert()
    checkSlugInsert(): void {
        if ( !this.slug ) {
            this.slug = this.title;
        }

        this.slug = this.slug.toLowerCase().replace(/\s+/g, '-');
    }

    @BeforeUpdate()
    checkSlugUpdate(): void {
        this.slug = this.slug.toLowerCase().replace(/\s+/g, '-');
    }
}
