import { VendorProductsService } from './vendor-products.service';
import { CreateVendorProductDto } from './dto/create-vendor-product.dto';
import { UpdateVendorProductDto } from './dto/update-vendor-product.dto';
export declare class VendorProductsController {
    private readonly vendorProductsService;
    constructor(vendorProductsService: VendorProductsService);
    create(createVendorProductDto: CreateVendorProductDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateVendorProductDto: UpdateVendorProductDto): string;
    remove(id: string): string;
}
