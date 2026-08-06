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
import { CreateProductCustomizationGroupDto } from './dto/create-product-customization.dto';
import { AuthGuard } from '@nestjs/passport';

import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiOkResponse, ApiQuery, ApiResponse } from '@nestjs/swagger';
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
  @ApiQuery({ name: 'categoryId', required: false, type: Number })
  @ApiQuery({ name: 'vendorId', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'customerId', required: false, type: Number })
  async getAllProducts(
    @Query() dto: RangeDTO,
    @Query('categoryId') categoryId?: number,
    @Query('vendorId') vendorId?: number,
    @Query('search') search?: string,
    @Query('customerId') customerId?: number,
  ) {
    return this.productsService.findAll(dto, categoryId, vendorId, search, customerId);
  }

  // @ApiOperation({ summary: 'Get all products' })
  // findAll() {
  //   return this.productsService.findAll();
  // }

  @Get('search')
  @ApiOperation({ summary: 'Search products by letters' })
  @ApiQuery({ name: 'letters', required: true, type: String })
  async searchByLetters(@Query('letters') letters: string) {
    return this.productsService.searchByLetters(letters);
  }

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

  // UPSERT PRODUCT CUSTOMIZATIONS
  @Post(':id/customizations')
  @ApiOperation({ summary: 'Upsert product customizations (Healthy Meals Only)' })
  @ApiParam({ name: 'id', type: Number })
  upsertCustomizations(
    @Param('id') id: string,
    @Body() groupsDto: CreateProductCustomizationGroupDto[]
  ) {
    return this.productsService.upsertCustomizations(+id, groupsDto);
  }

  // DELETE PRODUCT
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', type: Number })
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }

  // GET PRODUCT CUSTOMIZATIONS (CUSTOMER FACING)
  @Get(':id/customizations')
  @ApiOperation({ summary: 'Get product customizations for customer view' })
  @ApiParam({ name: 'id', type: Number, description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Customizations retrieved successfully',
    schema: {
      example: {
        productId: 60,
        productName: "Paneer Palak",
        hasCustomizations: true,
        groups: [
          {
            id: 1,
            name: "Cooking Preference",
            selectionType: "SINGLE",
            isRequired: true,
            displayOrder: 0,
            options: [
              {
                id: 1,
                name: "Cook in Olive Oil",
                additionalPrice: 40,
                displayOrder: 0
              }
            ]
          }
        ]
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found'
  })
  getCustomizations(@Param('id') id: string) {
    return this.productsService.getCustomizations(+id);
  }
}
