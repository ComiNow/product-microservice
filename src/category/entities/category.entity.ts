import { Product } from 'src/products/entities/product.entity';

export class Category {
  id: number;
  name: string;
  firstImage?: string;
  secondImage?: string;
  available: boolean;

  products?: Product[];
}
