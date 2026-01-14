import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';

import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from '@nestjs/passport';

import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiOkResponse } from '@nestjs/swagger';
import { Pagination } from 'src/helpers/pagination/dto/pagination.dto';
import { Product } from './entities/product.entity';
import { RangeDTO } from 'src/helpers/pagination/dto/range.dto';

@ApiTags('Products')
// @ApiBearerAuth()
// @UseGuards(AuthGuard('jwt'))
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  // CREATE PRODUCT
  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // GET ALL PRODUCTS
  // @Get()
  // @ApiOkResponse({
  //   description: 'Get all products with pagination',
  //   type: Pagination<Product>,
  // })
  // async getAllProducts(@Query() dto: RangeDTO) {
  //   return this.productsService.findAll(dto);
  // }
  @Get()
  @ApiOkResponse({
    description: 'Get all products with pagination',
    type: Pagination<Product>,
  })
  async getAllProducts(
    @Query() dto: RangeDTO,
    @Query('categoryId') categoryId?: number,
    @Query('vendorId') vendorId?: number,
  ) {
    return this.productsService.findAll(dto, categoryId,vendorId);
  }

  // @ApiOperation({ summary: 'Get all products' })
  // findAll() {
  //   return this.productsService.findAll();
  // }

  // GET SINGLE PRODUCT
  @Get(':id')
  @ApiOperation({ summary: 'Get a single product by ID' })
  @ApiParam({ name: 'id', type: Number })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  // UPDATE PRODUCT
  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', type: Number })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  // DELETE PRODUCT
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
