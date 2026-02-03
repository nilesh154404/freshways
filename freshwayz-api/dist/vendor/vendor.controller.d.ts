import { VendorService } from './vendor.service';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { UpdateVendorProfileDto } from './dto/update-vendor-profile.dto';
export declare class VendorController {
    private readonly vendorService;
    constructor(vendorService: VendorService);
    findAll(): Promise<import("./entities/vendor.entity").Vendor[]>;
    findOne(id: string): Promise<import("./entities/vendor.entity").Vendor>;
    update(id: string, dto: UpdateVendorDto): Promise<import("./entities/vendor.entity").Vendor>;
    updateProfile(id: string, dto: UpdateVendorProfileDto): Promise<import("./entities/vendor.entity").Vendor>;
    getDashboardStats(id: string): Promise<import("./dto/vendor-dashboard-stats.dto").VendorDashboardStatsDto>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
