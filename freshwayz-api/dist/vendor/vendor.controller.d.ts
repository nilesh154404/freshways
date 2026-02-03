import { VendorService } from './vendor.service';
import { UpdateVendorDto } from './dto/update-vendor.dto';
export declare class VendorController {
    private readonly vendorService;
    constructor(vendorService: VendorService);
    getVendorsCount(): Promise<{
        total: number;
        growth: number;
        newThisMonth: number;
    }>;
    findAll(): Promise<import("./entities/vendor.entity").Vendor[]>;
    findOne(id: string): Promise<import("./entities/vendor.entity").Vendor>;
    update(id: string, dto: UpdateVendorDto): Promise<import("./entities/vendor.entity").Vendor>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
