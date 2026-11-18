import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProductDiscountService } from './product-discount.service';
import { CreateProductDiscountDto } from './dto/create-product-discount.dto';
import { UpdateProductDiscountDto } from './dto/update-product-discount.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RangeDTO } from 'src/helpers/pagination/dto/range.dto';

@ApiTags('Product Discount')
@Controller('product-discount')
export class ProductDiscountController {
  constructor(private readonly productDiscountService: ProductDiscountService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'Vendor')
  create(@Body() createProductDiscountDto: CreateProductDiscountDto, @Req() req: any) {
    return this.productDiscountService.create(createProductDiscountDto, req.user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all product discounts with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query() dto: RangeDTO) {
    return this.productDiscountService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productDiscountService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'Vendor')
  update(@Param('id') id: string, @Body() updateProductDiscountDto: UpdateProductDiscountDto, @Req() req: any) {
    return this.productDiscountService.update(+id, updateProductDiscountDto, req.user);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'Vendor')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.productDiscountService.remove(+id, req.user);
  }
}
