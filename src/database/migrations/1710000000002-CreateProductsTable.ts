import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateProductsTable1710000000002 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'products',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'title',
                        type: 'text',
                        isUnique: true,
                    },
                    {
                        name: 'price',
                        type: 'float',
                        default: 0,
                    },
                    {
                        name: 'description',
                        type: 'text',
                        isNullable: true,
                    },
                    {
                        name: 'slug',
                        type: 'text',
                        isUnique: true,
                    },
                    {
                        name: 'stock',
                        type: 'int',
                        default: 0,
                    },
                    {
                        name: 'sizes',
                        type: 'text',
                        isArray: true,
                    },
                    {
                        name: 'gender',
                        type: 'enum',
                        enum: ['male', 'female', 'kid', 'unisex'],
                        default: "'unisex'",
                    },
                    {
                        name: 'tags',
                        type: 'text',
                        isArray: true,
                        default: 'ARRAY[]::text[]',
                    },
                    {
                        name: 'categoryId',
                        type: 'uuid',
                        isNullable: true,
                    },
                    {
                        name: 'createdAt',
                        type: 'timestamp',
                        default: 'now()',
                    },
                    {
                        name: 'updatedAt',
                        type: 'timestamp',
                        default: 'now()',
                    },
                ],
            }),
            true,
        );

        // Crear la foreign key hacia categories
        await queryRunner.createForeignKey(
            'products',
            new TableForeignKey({
                columnNames: ['categoryId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'categories',
                onDelete: 'SET NULL',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Primero eliminar la foreign key
        const table = await queryRunner.getTable('products');
        const foreignKey = table?.foreignKeys.find(
            fk => fk.columnNames.indexOf('categoryId') !== -1,
        );
        if (foreignKey) {
            await queryRunner.dropForeignKey('products', foreignKey);
        }

        // Luego eliminar la tabla
        await queryRunner.dropTable('products');
    }
}
