import { Injectable, BadRequestException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ILike } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { Categories } from 'src/categories/categories.entity';
import { Auth } from './entities/auth.entity';
import { UserType } from 'src/user-type/entities/user-type.entity';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { RegisterVendorDto } from 'src/vendor/dto/register-vendor.dto';
import { AuthDto } from './dto/auth.dto';
import { RegisterCustomerDto } from 'src/customer/dto/register-customer.dto';
import { Customer } from 'src/customer/entities/customer.entity';
import axios from 'axios';
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Vendor) private readonly vendorRepo: Repository<Vendor>,
        @InjectRepository(Categories) private readonly categoriesRepo: Repository<Categories>,
        @InjectRepository(Auth) private readonly authRepo: Repository<Auth>,
        @InjectRepository(UserType) private readonly userTypeRepo: Repository<UserType>,
        @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,

        private readonly jwtService: JwtService
    ) { }

    // ---------------------- USER REGISTRATION ----------------------
    async registerUser(dto: RegisterUserDto) {
        const existingAuth = await this.authRepo.findOne({ where: { username: dto.username } });
        if (existingAuth) throw new BadRequestException('Username already exists');

        const userType = await this.userTypeRepo.findOne({ where: { typeName: dto.userType } });
        if (!userType) throw new BadRequestException(`UserType "${dto.userType}" not found`);

        const user = this.userRepo.create({ ...dto.user, userType });
        await this.userRepo.save(user);

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const auth = this.authRepo.create({ username: dto.username, password: hashedPassword, user });
        await this.authRepo.save(auth);

        return { message: 'User registered successfully' };
    }

    // ---------------------- Customer REGISTRATION ----------------------
    async registerCustomer(dto: RegisterCustomerDto) {
        // Add validation check
        if (!dto.customer || !dto.customer.phone) {
            throw new BadRequestException('Customer data with phone is required');
        }

        const existingAuth = await this.authRepo.findOne({
            where: {
                // username: dto.username,
                username: dto.customer.phone,
                customer: {
                    email: dto.customer.email,
                    phone: dto.customer.phone
                },
            }
        });

        if (existingAuth) throw new BadRequestException('Username/Email/Phone already exists');

        const userType = await this.userTypeRepo.findOne({ where: { typeName: 'Customer' } });
        if (!userType) throw new BadRequestException('UserType "Customer" not found');

        const customer = this.customerRepo.create({ ...dto.customer, userType });
        await this.customerRepo.save(customer);

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const auth = this.authRepo.create({ username: dto.customer.phone, password: hashedPassword, customer });
        await this.authRepo.save(auth);
        // 3. Call external API using axios
        try {
            console.log({
                username: dto.customer.phone,
                password: dto.password,
                user_from: "app2_pharmacy_system",
            });

            const externalResponse = await axios.post(
                'https://healthamigoapi.dexpertsystems.com/user/internal/register',
                {
                    username: dto.customer.phone,
                    password: dto.password,
                    user_from: "app2_pharmacy_system",
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': 'XM4OeVKQT8SlRaVDC3RkFPaypmOe7CFcMU1hbseXB87RvXaFhC5vRUjOlq5hK5zA',
                    },
                    timeout: 10000,  // optional timeout
                }
            );

            return {
                message: 'Customer created successfully',
                localUser: customer,
                externalResponse: externalResponse.data,
            };
        } catch (error) {
            console.error("External registration error:", {
                message: error.message,
                responseData: error.response?.data,
                responseStatus: error.response?.status,
                headers: error.response?.headers,
            });

            // optional: rollback local user creation if external fails
            // await this.repository.delete({ id: user.id });

            throw new BadRequestException(
                `External registration failed: ${error.response?.data?.message || error.message
                }`
            );
        }
        // return { message: 'Customer registered successfully' };
    }

    // ---------------------- VENDOR REGISTRATION ----------------------
    async registerVendor(dto: RegisterVendorDto) {
        const existingAuth = await this.authRepo.findOne({ where: { username: dto.username } });
        if (existingAuth) throw new BadRequestException('Username already exists');

        const userType = await this.userTypeRepo.findOne({ where: { typeName: 'Vendor' } });
        if (!userType) throw new BadRequestException('UserType "Vendor" not found');

        // Exclude categories from the create call as it expects Category entities, not IDs
        const { categories: categoryIds, ...vendorData } = dto.vendor;
        const vendor = this.vendorRepo.create({ ...vendorData, userType });

        // Fetch and assign categories separately if provided
        if (categoryIds && categoryIds.length > 0) {
            const categories = await this.categoriesRepo.findBy({ id: In(categoryIds) });
            vendor.categories = categories;
        }

        await this.vendorRepo.save(vendor);

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const auth = this.authRepo.create({ username: dto.username, password: hashedPassword, vendor });
        await this.authRepo.save(auth);

        return { message: 'Vendor registered successfully' };
    }

    // ---------------------- LOGIN ----------------------
    async login(dto: AuthDto) {
        const auth = await this.authRepo.findOne({
            where: { username: dto.username },
            relations: ['user', 'vendor', 'customer', 'user.userType', 'vendor.userType', 'customer.userType']
        });

        if (!auth) throw new UnauthorizedException('Invalid credentials');

        const isMatch = await bcrypt.compare(dto.password, auth.password);
        if (!isMatch) throw new UnauthorizedException('Invalid credentials');

        // Determine role
        let role = 'Unknown';
        let profileId: number | null = null;
        if (auth.user) {
            role = auth.user.userType.typeName;
            profileId = auth.user.id;
        } else if (auth.vendor) {
            role = auth.vendor.userType.typeName;
            profileId = auth.vendor.id;
        } else if (auth.customer) {
            role = auth.customer.userType.typeName;
            profileId = auth.customer.id;
        }

        const payload = { username: auth.username, sub: auth.id, role, profileId };
        const accessToken = this.jwtService.sign(payload);

        return { accessToken, role, profileId };
    }


    // async googleLogin(googleUser: {
    //     email: string;
    //     fullName: string;
    // }) {

    //     if (!googleUser || !googleUser.email) {
    //         throw new UnauthorizedException("Google login failed");
    //     }

    //     const email = googleUser.email;

    //     let customer = await this.customerRepo.findOne({
    //         where: { email }
    //     });

    //     // Create new if not found
    //     if (!customer) {
    //         customer = this.customerRepo.create({
    //             email: googleUser.email,
    //             fullName: googleUser.fullName,
    //             userType: { id: 2 } // customer role id
    //         });

    //         await this.customerRepo.save(customer);
    //     }

    //     // JWT payload structure
    //     const payload = {
    //         sub: customer.id,
    //         email: customer.email,
    //         role: "Customer"
    //     };

    //     // Use Nest JWT Service
    //     const token = this.jwtService.sign(payload);
    //     console.log(`freshwayz://google-register?email=${customer.email}&name=${customer.fullName}`);

    //     // return {
    //     //     url: `freshwayz://google-register?email=${customer.email}&name=${customer.fullName}`,
    //     // };
    //     // return `freshwayz://google-register?email=${encodeURIComponent(
    //     //     customer.email,
    //     // )}&name=${encodeURIComponent(customer.fullName)}`;
    //     return {
    //         message: "Login successful",
    //         accessToken: token,
    //         role: "Customer",
    //         profileId: customer.id,
    //         customer
    //     };
    // }

    async googleLogin(googleUser: { email: string; fullName: string }) {
        if (!googleUser || !googleUser.email) throw new UnauthorizedException();

        let customer = await this.customerRepo.findOne({ where: { email: googleUser.email } });
        if (!customer) {
            customer = this.customerRepo.create({
                email: googleUser.email,
                fullName: googleUser.fullName,
                userType: { id: 2 }
            });
            await this.customerRepo.save(customer);
        }

        const payload = { sub: customer.id, email: customer.email, role: "Customer" };
        const token = this.jwtService.sign(payload);

        // Build deep link for mobile
        const deepLink = `freshwayz://google-register?email=${encodeURIComponent(customer.email)}&name=${encodeURIComponent(customer.fullName)}&id=${encodeURIComponent(customer.id)}&token=${token}`;

        return deepLink; // <-- string for redirect
    }

    // (username:string){}
    async findOneCustomer(username: string) {
        // const auth = await this.customerRepo.findOne({
        //     where: { phone: username },
        //     // relations: ['customer',],
        //     // select: {
        //     //     customer: true,
        //     // },
        // });
        const auth = await this.customerRepo.findOne({
            where: [
                { phone: username },
                { email: ILike(username) },
            ],
        });
        if (!auth) throw new NotFoundException('Customer not found');
        return auth;
    }

    async findCustomer() {
        const customer = await this.customerRepo.find();

        if (!customer) throw new NotFoundException('Customer not found');
        return customer;
    }
}


// import { Injectable } from '@nestjs/common';
// import { CreateAuthDto } from './dto/create-auth.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';

// @Injectable()
// export class AuthService {
//   create(createAuthDto: CreateAuthDto) {
//     return 'This action adds a new auth';
//   }

//   findAll() {
//     return `This action returns all auth`;
//   }

//   findOne(id: number) {
//     return `This action returns a #${id} auth`;
//   }

//   update(id: number, updateAuthDto: UpdateAuthDto) {
//     return `This action updates a #${id} auth`;
//   }

//   remove(id: number) {
//     return `This action removes a #${id} auth`;
//   }
// }
