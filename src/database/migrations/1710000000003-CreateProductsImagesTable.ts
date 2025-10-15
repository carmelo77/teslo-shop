import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateProductsImagesTable1710000000003 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'products_images',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'url',
                        type: 'text',
                    },
                    {
                        name: 'productId',
                        type: 'uuid',
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

        // Crear la foreign key hacia products con CASCADE
        await queryRunner.createForeignKey(
            'products_images',
            new TableForeignKey({
                columnNames: ['productId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'products',
                onDelete: 'CASCADE',
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Primero eliminar la foreign key
        const table = await queryRunner.getTable('products_images');
        const foreignKey = table?.foreignKeys.find(
            fk => fk.columnNames.indexOf('productId') !== -1,
        );
        if (foreignKey) {
            await queryRunner.dropForeignKey('products_images', foreignKey);
        }

        // Luego eliminar la tabla
        await queryRunner.dropTable('products_images');
    }
}
