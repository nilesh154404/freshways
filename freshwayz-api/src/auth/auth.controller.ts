import { Controller, Post, Body, Get, Param, UseGuards, Redirect, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterUserDto } from 'src/user/dto/register-user.dto';
import { RegisterVendorDto } from 'src/vendor/dto/register-vendor.dto';
import { AuthDto } from './dto/auth.dto';
import { RegisterCustomerDto } from 'src/customer/dto/register-customer.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Req } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

const multipartMemoryConfig = {
    storage: memoryStorage(),
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register/user')
    @ApiOperation({ summary: 'Register as a User(Admin & Staff)' })
    @ApiResponse({ status: 201, description: 'User registered successfully' })
    async registerUser(@Body() dto: RegisterUserDto) {
        return this.authService.registerUser(dto);
    }

    @Post('register/vendor')
    @ApiOperation({ summary: 'Register as a Vendor' })
    @ApiResponse({ status: 201, description: 'Vendor registered successfully' })
    async registerVendor(@Body() dto: RegisterVendorDto) {
        return this.authService.registerVendor(dto);
    }

    @Post('register/customer')
    @ApiOperation({ summary: 'Register as a Customer' })
    @ApiResponse({ status: 201, description: 'Customer registered successfully' })
    async registerCustomer(@Body() dto: RegisterCustomerDto) {
        return this.authService.registerCustomer(dto);
    }

    @Post('login')
    @ApiOperation({ summary: 'Login for User/Vendor' })
    @ApiResponse({ status: 200, description: 'Returns JWT token' })
    async login(@Body() dto: AuthDto) {
        return this.authService.login(dto);
    }

    @Post('guest-login')
    @ApiOperation({
        summary: 'Guest Login',
        description:
            'Issues a 24-hour JWT for unauthenticated (guest) users. ' +
            'No account is created. Guest tokens allow read-only access to products, ' +
            'marketing content, vendors, subscription plans, communities, and generic AI recommendations. ' +
            'Placing orders, subscribing, and managing profiles require a registered account.',
    })
    @ApiResponse({
        status: 201,
        description: 'Guest token issued successfully',
        schema: {
            example: {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                role: 'Guest',
            },
        },
    })
    async guestLogin() {
        return this.authService.guestLogin();
    }

    @Get('customer/:username')
    findOne(@Param('username') username: string) {
        return this.authService.findOneCustomer(username);
    }

    @Get('customer')
    findCustomes() {
        return this.authService.findCustomer();
    }

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleAuth() {
        return;
    }

    @Get('google/redirect')
    @UseGuards(GoogleAuthGuard)
    // Use passthrough: true to allow Interceptors and manual Res to coexist
    async googleAuthRedirect(@Req() req, @Res({ passthrough: true }) res) {
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
            return html; // Return the string so Interceptors can see it safely
        } catch (error) {
            console.error('Google Auth Error:', error);
            res.status(500);
            return { message: 'Internal Server Error' };
        }
    }

}


// import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { CreateAuthDto } from './dto/create-auth.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';

// @Controller('auth')
// export class AuthController {
//   constructor(private readonly authService: AuthService) {}

//   @Post()
//   create(@Body() createAuthDto: CreateAuthDto) {
//     return this.authService.create(createAuthDto);
//   }

//   @Get()
//   findAll() {
//     return this.authService.findAll();
//   }

//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.authService.findOne(+id);
//   }

//   @Patch(':id')
//   update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
//     return this.authService.update(+id, updateAuthDto);
//   }

//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.authService.remove(+id);
//   }
// }
