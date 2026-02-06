import { AuthService } from './auth.service';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { RegisterVendorDto } from 'src/vendor/dto/register-vendor.dto';
import { AuthDto } from './dto/auth.dto';
import { RegisterCustomerDto } from 'src/customer/dto/register-customer.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    registerUser(dto: RegisterUserDto): Promise<{
        message: string;
    }>;
    registerVendor(dto: RegisterVendorDto): Promise<{
        message: string;
    }>;
    registerCustomer(dto: RegisterCustomerDto): Promise<{
        message: string;
        localUser: import("../customer/entities/customer.entity").Customer;
        externalResponse: any;
    }>;
    login(dto: AuthDto): Promise<{
        accessToken: string;
        role: string;
        profileId: number | null;
    }>;
    findOne(username: string): Promise<import("../customer/entities/customer.entity").Customer>;
    findCustomes(): Promise<import("../customer/entities/customer.entity").Customer[]>;
    googleAuth(): Promise<void>;
    googleAuthRedirect(req: any, res: any): Promise<string | {
        message: string;
    }>;
}
