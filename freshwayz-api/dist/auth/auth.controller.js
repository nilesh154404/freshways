"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const register_user_dto_1 = require("../user/dto/register-user.dto");
const register_vendor_dto_1 = require("../vendor/dto/register-vendor.dto");
const auth_dto_1 = require("./dto/auth.dto");
const register_customer_dto_1 = require("../customer/dto/register-customer.dto");
const google_auth_guard_1 = require("./guards/google-auth.guard");
const common_2 = require("@nestjs/common");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async registerUser(dto) {
        return this.authService.registerUser(dto);
    }
    async registerVendor(dto) {
        return this.authService.registerVendor(dto);
    }
    async registerCustomer(dto) {
        return this.authService.registerCustomer(dto);
    }
    async login(dto) {
        return this.authService.login(dto);
    }
    findOne(username) {
        return this.authService.findOneCustomer(username);
    }
    findCustomes() {
        return this.authService.findCustomer();
    }
    async googleAuth() {
        return;
    }
    async googleAuthRedirect(req, res) {
        try {
            const url = await this.authService.googleLogin(req.user);
            const html = `
              <html>
                <body onload="window.location.href='${url}'">
                    <p>Redirecting to Freshways App...</p>
                    <script>
                        try {
                            setTimeout(() => {
                                window.location.href = "${url}";
                            }, 100);
                        } catch (error) {
                            // Show error directly on the page
                            const errorMessage = document.createElement('p');
                            errorMessage.style.color = 'red';
                            errorMessage.textContent = "Redirect failed: " + error.message;
                            document.body.appendChild(errorMessage);

                            // Optional: provide a clickable fallback link
                            const link = document.createElement('a');
                            link.href = "${url}";
                            link.textContent = "Click here to open Freshways App";
                            document.body.appendChild(link);
                        }
                    </script>
                </body>
                </html>
                    `;
            res.set('Content-Type', 'text/html');
            return html;
        }
        catch (error) {
            console.error('Google Auth Error:', error);
            res.status(500);
            return { message: 'Internal Server Error' };
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register/user'),
    (0, swagger_1.ApiOperation)({ summary: 'Register as a User(Admin & Staff)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'User registered successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_user_dto_1.RegisterUserDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerUser", null);
__decorate([
    (0, common_1.Post)('register/vendor'),
    (0, swagger_1.ApiOperation)({ summary: 'Register as a Vendor' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Vendor registered successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_vendor_dto_1.RegisterVendorDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerVendor", null);
__decorate([
    (0, common_1.Post)('register/customer'),
    (0, swagger_1.ApiOperation)({ summary: 'Register as a Customer' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Customer registered successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_customer_dto_1.RegisterCustomerDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registerCustomer", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Login for User/Vendor' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns JWT token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.AuthDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('customer/:username'),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('customer'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "findCustomes", null);
__decorate([
    (0, common_1.Get)('google'),
    (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuth", null);
__decorate([
    (0, common_1.Get)('google/redirect'),
    (0, common_1.UseGuards)(google_auth_guard_1.GoogleAuthGuard),
    __param(0, (0, common_2.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuthRedirect", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map