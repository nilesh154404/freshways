import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Auth } from './entities/auth.entity';
import { User } from 'src/user/entities/user.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { UserType } from 'src/user-type/entities/user-type.entity';
import { JwtStrategy } from './jwt.strategy';
import { Customer } from 'src/customer/entities/customer.entity';
import { GoogleStrategy } from './strategies/google.strategy';
@Module({
  imports: [
    TypeOrmModule.forFeature([Auth, User, Vendor, Customer, UserType]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || "SECRET123",
        signOptions: { expiresIn: "7d" }
      })
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  exports: [AuthService]
})
export class AuthModule { }
