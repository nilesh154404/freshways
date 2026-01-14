import { Repository } from 'typeorm';
import { Vendor } from './entities/vendor.entity';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { UserType } from 'src/user-type/entities/user-type.entity';
export declare class VendorService {
    private readonly vendorRepo;
    private readonly userTypeRepo;
    constructor(vendorRepo: Repository<Vendor>, userTypeRepo: Repository<UserType>);
    findAll(): Promise<Vendor[]>;
    findOne(id: number): Promise<Vendor>;
    update(id: number, updateData: UpdateVendorDto): Promise<Vendor>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
