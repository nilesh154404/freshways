import { CreateVendorProductDto } from './dto/create-vendor-product.dto';
import { UpdateVendorProductDto } from './dto/update-vendor-product.dto';
export declare class VendorProductsService {
    create(createVendorProductDto: CreateVendorProductDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateVendorProductDto: UpdateVendorProductDto): string;
    remove(id: number): string;
}
