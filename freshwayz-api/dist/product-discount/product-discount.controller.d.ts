import { ProductDiscountService } from './product-discount.service';
import { CreateProductDiscountDto } from './dto/create-product-discount.dto';
import { UpdateProductDiscountDto } from './dto/update-product-discount.dto';
export declare class ProductDiscountController {
    private readonly productDiscountService;
    constructor(productDiscountService: ProductDiscountService);
    create(createProductDiscountDto: CreateProductDiscountDto): Promise<import("./entities/product-discount.entity").ProductDiscount>;
    findAll(): Promise<import("./entities/product-discount.entity").ProductDiscount[]>;
    findOne(id: string): Promise<import("./entities/product-discount.entity").ProductDiscount>;
    update(id: string, updateProductDiscountDto: UpdateProductDiscountDto): Promise<import("./entities/product-discount.entity").ProductDiscount>;
    remove(id: string): Promise<void>;
}
