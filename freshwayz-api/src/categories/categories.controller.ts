import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { CategoriesService } from './categories.service';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RangeDTO } from 'src/helpers/pagination/dto/range.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
    constructor(private service: CategoriesService) { }

    @Get('get-categories')
    @ApiOperation({ summary: 'Get active categories with pagination' })
    async getCategories(@Query() dto: RangeDTO) {
        return await this.service.getCategories(dto);
    }

    @Post()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Admin', 'Super Admin')
    create(@Body() dto: CreateCategoryDto) {
        return this.service.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all categories with pagination' })
    findAll(@Query() dto: RangeDTO) {
        return this.service.findAll(dto);
    }

    @Get(":id")
    findOne(@Param("id") id: number) {
        return this.service.findOne(+id);
    }

    @Patch(":id")
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Admin', 'Super Admin')
    update(
        @Param("id") id: number,
        @Body() dto: UpdateCategoryDto,
    ) {
        return this.service.update(+id, dto);
    }

    @Delete(":id")
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('Admin', 'Super Admin')
    remove(@Param("id") id: number) {
        return this.service.remove(+id);
    }
}
