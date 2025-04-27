import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [ProductsModule, CategoryModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
