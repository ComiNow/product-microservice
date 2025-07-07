import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { AuthModule } from './auth/auth.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './category/category.module';
import { OrdersModule } from './orders/orders.module';
import { FilesModule } from './files/files.module';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
    const appModule = module.get(AppModule);
    expect(appModule).toBeInstanceOf(AppModule);
  });

  it('should import all required modules', () => {
    const imports = Reflect.getMetadata('imports', AppModule);
    expect(imports).toContain(AuthModule);
    expect(imports).toContain(HealthCheckModule);
    expect(imports).toContain(ProductsModule);
    expect(imports).toContain(CategoryModule);
    expect(imports).toContain(OrdersModule);
    expect(imports).toContain(FilesModule);
  });
});
