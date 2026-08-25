import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Auth } from './entities/auth.entity';
import { User } from 'src/user/entities/user.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { UserType } from 'src/user-type/entities/user-type.entity';
import { JwtStrategy } from './jwt.strategy';
import { Customer } from 'src/customer/entities/customer.entity';
import { Categories } from 'src/categories/categories.entity';
import { GoogleStrategy } from './strategies/google.strategy';
import { HealthProfile } from 'src/ai/entities/health-profile.entity';
import { AiService } from 'src/ai/ai.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auth, User, Vendor, Customer, UserType, Categories, HealthProfile]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || "SECRET123",
        signOptions: { expiresIn: "7d" }
      })
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, AiService, JwtAuthGuard, RolesGuard],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule { }
