import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { CategoryModule } from './category/category.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [ProductsModule, CategoryModule, FilesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
