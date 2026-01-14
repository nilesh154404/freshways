import { CreateProductDiscountDto } from './dto/create-product-discount.dto';
import { UpdateProductDiscountDto } from './dto/update-product-discount.dto';
import { ProductDiscount } from './entities/product-discount.entity';
import { Repository } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
export declare class ProductDiscountService {
    private readonly discountRepo;
    private readonly productRepo;
    constructor(discountRepo: Repository<ProductDiscount>, productRepo: Repository<Product>);
    calculatePrice(basePrice: number, quantity: number, discount?: ProductDiscount): {
        finalTotal: number;
        freeItems?: number;
    };
    create(dto: CreateProductDiscountDto): Promise<ProductDiscount>;
    findAll(): Promise<ProductDiscount[]>;
    findOne(id: number): Promise<ProductDiscount>;
    update(id: number, dto: UpdateProductDiscountDto): Promise<ProductDiscount>;
    remove(id: number): Promise<void>;
}
