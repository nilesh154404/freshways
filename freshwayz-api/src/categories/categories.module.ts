import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesController } from './categories.controller';
import { Categories } from './categories.entity';
import { CategoriesService } from './categories.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Categories]), AuthModule],
  controllers: [CategoriesController],
  providers: [CategoriesService]
})
export class CategoriesModule { }
