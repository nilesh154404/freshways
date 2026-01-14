import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/entities/user.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { Auth } from './entities/auth.entity';
import { UserType } from 'src/user-type/entities/user-type.entity';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { RegisterVendorDto } from 'src/vendor/dto/register-vendor.dto';
import { AuthDto } from './dto/auth.dto';
import { RegisterCustomerDto } from 'src/customer/dto/register-customer.dto';
import { Customer } from 'src/customer/entities/customer.entity';
export declare class AuthService {
    private readonly userRepo;
    private readonly vendorRepo;
    private readonly authRepo;
    private readonly userTypeRepo;
    private readonly customerRepo;
    private readonly jwtService;
    constructor(userRepo: Repository<User>, vendorRepo: Repository<Vendor>, authRepo: Repository<Auth>, userTypeRepo: Repository<UserType>, customerRepo: Repository<Customer>, jwtService: JwtService);
    registerUser(dto: RegisterUserDto): Promise<{
        message: string;
    }>;
    registerCustomer(dto: RegisterCustomerDto): Promise<{
        message: string;
        localUser: Customer;
        externalResponse: any;
    }>;
    registerVendor(dto: RegisterVendorDto): Promise<{
        message: string;
    }>;
    login(dto: AuthDto): Promise<{
        accessToken: string;
        role: string;
        profileId: number | null;
    }>;
    googleLogin(googleUser: {
        email: string;
        fullName: string;
    }): Promise<string>;
    findOneCustomer(username: string): Promise<Customer | undefined>;
    findCustomer(): Promise<Customer[]>;
}
