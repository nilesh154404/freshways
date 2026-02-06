import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Pagination } from 'src/helpers/pagination/dto/pagination.dto';
import { Product } from './entities/product.entity';
import { RangeDTO } from 'src/helpers/pagination/dto/range.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto): Promise<Product>;
    getAllProducts(dto: RangeDTO, categoryId?: number, vendorId?: number): Promise<Pagination<Product>>;
    findOne(id: string): Promise<Product | null>;
    update(id: string, updateProductDto: UpdateProductDto): string;
    remove(id: string): Promise<import("typeorm").DeleteResult>;
}
