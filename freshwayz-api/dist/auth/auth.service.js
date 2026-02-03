"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const jwt_1 = require("@nestjs/jwt");
const user_entity_1 = require("../user/entities/user.entity");
const vendor_entity_1 = require("../vendor/entities/vendor.entity");
const auth_entity_1 = require("./entities/auth.entity");
const user_type_entity_1 = require("../user-type/entities/user-type.entity");
const customer_entity_1 = require("../customer/entities/customer.entity");
const axios_1 = __importDefault(require("axios"));
let AuthService = class AuthService {
    userRepo;
    vendorRepo;
    authRepo;
    userTypeRepo;
    customerRepo;
    jwtService;
    constructor(userRepo, vendorRepo, authRepo, userTypeRepo, customerRepo, jwtService) {
        this.userRepo = userRepo;
        this.vendorRepo = vendorRepo;
        this.authRepo = authRepo;
        this.userTypeRepo = userTypeRepo;
        this.customerRepo = customerRepo;
        this.jwtService = jwtService;
    }
    async registerUser(dto) {
        const existingAuth = await this.authRepo.findOne({ where: { username: dto.username } });
        if (existingAuth)
            throw new common_1.BadRequestException('Username already exists');
        const userType = await this.userTypeRepo.findOne({ where: { typeName: dto.userType } });
        if (!userType)
            throw new common_1.BadRequestException(`UserType "${dto.userType}" not found`);
        const user = this.userRepo.create({ ...dto.user, userType });
        await this.userRepo.save(user);
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const auth = this.authRepo.create({ username: dto.username, password: hashedPassword, user });
        await this.authRepo.save(auth);
        return { message: 'User registered successfully' };
    }
    async registerCustomer(dto) {
        const existingAuth = await this.authRepo.findOne({
            where: {
                username: dto.customer.phone,
                customer: {
                    email: dto.customer.email,
                    phone: dto.customer.phone
                },
            }
        });
        if (existingAuth)
            throw new common_1.BadRequestException('Username/Email/Phone already exists');
        const userType = await this.userTypeRepo.findOne({ where: { typeName: 'Customer' } });
        if (!userType)
            throw new common_1.BadRequestException('UserType "Customer" not found');
        const customer = this.customerRepo.create({ ...dto.customer, userType });
        await this.customerRepo.save(customer);
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const auth = this.authRepo.create({ username: dto.customer.phone, password: hashedPassword, customer });
        await this.authRepo.save(auth);
        try {
            console.log({
                username: dto.customer.phone,
                password: dto.password,
                user_from: "app2_pharmacy_system",
            });
            const externalResponse = await axios_1.default.post('https://healthamigoapi.dexpertsystems.com/user/internal/register', {
                username: dto.customer.phone,
                password: dto.password,
                user_from: "app2_pharmacy_system",
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'XM4OeVKQT8SlRaVDC3RkFPaypmOe7CFcMU1hbseXB87RvXaFhC5vRUjOlq5hK5zA',
                },
                timeout: 10000,
            });
            return {
                message: 'Customer created successfully',
                localUser: customer,
                externalResponse: externalResponse.data,
            };
        }
        catch (error) {
            console.error("External registration error:", {
                message: error.message,
                responseData: error.response?.data,
                responseStatus: error.response?.status,
                headers: error.response?.headers,
            });
            throw new common_1.BadRequestException(`External registration failed: ${error.response?.data?.message || error.message}`);
        }
    }
    async registerVendor(dto) {
        const existingAuth = await this.authRepo.findOne({ where: { username: dto.username } });
        if (existingAuth)
            throw new common_1.BadRequestException('Username already exists');
        const userType = await this.userTypeRepo.findOne({ where: { typeName: 'Vendor' } });
        if (!userType)
            throw new common_1.BadRequestException('UserType "Vendor" not found');
        const { categories, ...restVendorData } = dto.vendor;
        const vendor = this.vendorRepo.create({ ...restVendorData, userType });
        if (categories && categories.length > 0) {
            vendor.categories = categories.map(id => ({ id }));
        }
        await this.vendorRepo.save(vendor);
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        const auth = this.authRepo.create({ username: dto.username, password: hashedPassword, vendor });
        await this.authRepo.save(auth);
        return { message: 'Vendor registered successfully' };
    }
    async login(dto) {
        const auth = await this.authRepo.createQueryBuilder('auth')
            .leftJoinAndSelect('auth.user', 'user')
            .leftJoinAndSelect('auth.vendor', 'vendor')
            .leftJoinAndSelect('auth.customer', 'customer')
            .leftJoinAndSelect('user.userType', 'userType')
            .leftJoinAndSelect('vendor.userType', 'vendorType')
            .leftJoinAndSelect('customer.userType', 'customerType')
            .where('auth.username = :input', { input: dto.username })
            .orWhere('user.email = :input', { input: dto.username })
            .orWhere('vendor.email = :input', { input: dto.username })
            .orWhere('customer.email = :input', { input: dto.username })
            .getOne();
        if (!auth)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const isMatch = await bcrypt.compare(dto.password, auth.password);
        if (!isMatch)
            throw new common_1.UnauthorizedException('Invalid credentials');
        let role = 'Unknown';
        let profileId = null;
        if (auth.user) {
            role = auth.user.userType.typeName;
            profileId = auth.user.id;
        }
        else if (auth.vendor) {
            role = auth.vendor.userType.typeName;
            profileId = auth.vendor.id;
        }
        else if (auth.customer) {
            role = auth.customer.userType.typeName;
            profileId = auth.customer.id;
        }
        const payload = { username: auth.username, sub: auth.id, role, profileId };
        const accessToken = this.jwtService.sign(payload);
        return { accessToken, role, profileId };
    }
    async googleLogin(googleUser) {
        if (!googleUser || !googleUser.email)
            throw new common_1.UnauthorizedException();
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
        const deepLink = `freshwayz://google-register?email=${encodeURIComponent(customer.email)}&name=${encodeURIComponent(customer.fullName)}$id=${encodeURIComponent(customer.id)}&token=${token}`;
        return deepLink;
    }
    async findOneCustomer(username) {
        const auth = await this.customerRepo.findOne({
            where: { phone: username },
        });
        if (!auth)
            throw new common_1.NotFoundException('Customer not found');
        return auth;
    }
    async findCustomer() {
        const customer = await this.customerRepo.find();
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        return customer;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(vendor_entity_1.Vendor)),
    __param(2, (0, typeorm_1.InjectRepository)(auth_entity_1.Auth)),
    __param(3, (0, typeorm_1.InjectRepository)(user_type_entity_1.UserType)),
    __param(4, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map