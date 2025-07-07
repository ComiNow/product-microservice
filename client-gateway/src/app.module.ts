import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './category/category.module';
import { OrdersModule } from './orders/orders.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [
    AuthModule,
    HealthCheckModule,
    OrdersModule,
    ProductsModule,
    CategoryModule,
    FilesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
