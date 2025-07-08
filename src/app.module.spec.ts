import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './category/category.module';
import { FilesModule } from './files/files.module';
import { PrismaService } from '../prisma/prisma.service';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({}) // Provee un mock vacío para PrismaService
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
    const appModule = module.get(AppModule);
    expect(appModule).toBeInstanceOf(AppModule);
  });

  it('should import ProductsModule, CategoryModule and FilesModule', () => {
    const imports = Reflect.getMetadata('imports', AppModule);
    expect(imports).toContain(ProductsModule);
    expect(imports).toContain(CategoryModule);
    expect(imports).toContain(FilesModule);
  });
});
