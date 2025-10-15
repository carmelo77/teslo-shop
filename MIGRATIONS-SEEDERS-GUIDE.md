# 🚀 Guía Rápida: Migraciones y Seeders

## 📦 Scripts en `package.json`

```json
{
  "scripts": {
    "// === MIGRACIONES ===": "",
    "migration:show": "typeorm-ts-node-commonjs migration:show -d src/database/data-source.ts",
    "migration:run": "typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts",
    "migration:revert": "typeorm-ts-node-commonjs migration:revert -d src/database/data-source.ts",
    "migration:generate": "typeorm-ts-node-commonjs migration:generate -d src/database/data-source.ts",
    "migration:create": "typeorm-ts-node-commonjs migration:create",
    
    "// === SEEDERS ===": "",
    "seed": "ts-node -r tsconfig-paths/register src/database/seeders/run-seeder.ts",
    "seed:build": "npm run build && node dist/database/seeders/run-seeder.js"
  }
}
```

---

## 🛠️ Comandos Esenciales

### 🔄 Migraciones

1. **Generar migración** (automática):
   ```bash
   npm run migration:generate src/database/migrations/NombreDescriptivo
   ```
   
2. **Ejecutar migraciones pendientes**:
   ```bash
   npm run migration:run
   ```

3. **Revertir la última migración**:
   ```bash
   npm run migration:revert
   ```

4. **Ver estado de migraciones**:
   ```bash
   npm run migration:show
   ```

### 🌱 Seeders

1. **Ejecutar seeders** (desarrollo):
   ```bash
   npm run seed
   ```

2. **Ejecutar en producción**:
   ```bash
   npm run seed:build
   ```



### 2. Scripts necesarios en package.json

```json
{
  "scripts": {
    "// === MIGRACIONES ===": "",
    "migration:show": "typeorm-ts-node-commonjs migration:show -d src/database/data-source.ts",
    "migration:run": "typeorm-ts-node-commonjs migration:run -d src/database/data-source.ts",
    "migration:revert": "typeorm-ts-node-commonjs migration:revert -d src/database/data-source.ts",
    "migration:generate": "typeorm-ts-node-commonjs migration:generate -d src/database/data-source.ts",
    "migration:create": "typeorm-ts-node-commonjs migration:create",
    
    "// === SEEDERS ===": "",
    "seed": "ts-node -r tsconfig-paths/register src/database/seeders/run-seeder.ts",
    "seed:build": "npm run build && node dist/database/seeders/run-seeder.js"
  }
}
```

---

## 🚀 Uso

### Migraciones

#### Ver estado
```bash
npm run migration:show
```
```
 [X] CreateCategoriesTable1710000000001
 [X] CreateProductsTable1710000000002
 [ ] AddDiscountToProducts1710000000003  ← Pendiente
```

#### Ejecutar pendientes
```bash
npm run migration:run
```

#### Revertir última
```bash
npm run migration:revert
```

#### Generar automáticamente
```bash
npm run migration:generate src/database/migrations/AddDiscountToProducts
```

TypeORM compara tus entidades con la BD y genera el código.

#### Crear vacía
```bash
npm run migration:create src/database/migrations/CustomMigration
```

### Seeders

```bash
# En desarrollo
npm run seed

# En producción (compilado)
npm run seed:build
```


**Ejemplo de datos:**

| id | timestamp     | name                              |
|----|---------------|-----------------------------------|
| 1  | 1710000000001 | CreateCategoriesTable1710000000001|
| 2  | 1710000000002 | CreateProductsTable1710000000002  |

**Esto previene:**
- ✅ Ejecutar la misma migración dos veces
- ✅ Desorden en el historial
- ✅ Conflictos entre desarrolladores

---

### Sistema Profesional (Script)

```
npm run seed  →  Conexión directa  →  Database
```

**Pros:**
- ✅ Seguro (no expuesto)
- ✅ No requiere app corriendo
- ✅ Integrable en CI/CD
- ✅ Ejecutable antes del deploy

**Contras:**
- ❌ Requiere terminal
- ❌ Necesita configuración adicional

---

## 🚦 Cómo Activar el Sistema (cuando estés listo)

### Paso 1: Instalar dependencias
```bash
npm install -D ts-node typeorm
```

### Paso 2: Agregar scripts
Copia los scripts de la sección "Scripts necesarios" a tu `package.json`.

### Paso 3: Probar en BD de prueba
```bash
# Crear BD de prueba
createdb teslo-shop-test

# Ejecutar migraciones
DB_NAME=teslo-shop-test npm run migration:run

# Ejecutar seeders
DB_NAME=teslo-shop-test npm run seed
```

### Paso 4: Cambiar a producción
```typescript
// app.module.ts
TypeOrmModule.forRoot({
  ...databaseConfig,
  synchronize: process.env.NODE_ENV !== 'production',
})
```

### Paso 5: Deploy
```bash
npm run build
npm run migration:run
npm run seed:build
npm run start:prod
```