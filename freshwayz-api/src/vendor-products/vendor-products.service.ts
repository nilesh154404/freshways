import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from 'src/products/entities/product.entity';
import { CreateVendorProductDto } from './dto/create-vendor-product.dto';
import { UpdateVendorProductDto } from './dto/update-vendor-product.dto';
import { paginate, PaginatedResponse } from 'src/helpers/pagination/pagination';
import { RangeDTO } from 'src/helpers/pagination/dto/range.dto';

@Injectable()
export class VendorProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>
  ) {}

  create(createVendorProductDto: CreateVendorProductDto) {
    return 'This action adds a new vendorProduct';
  }

  async findAll(dto?: RangeDTO, vendorId?: number): Promise<PaginatedResponse<Product>> {
    const qb = this.productRepo.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.vendor', 'vendor')
      .leftJoinAndSelect('product.dailyPrices', 'dailyPrices')
      .orderBy('product.id', 'DESC');

    if (vendorId) {
      qb.andWhere('product.vendor = :vendorId', { vendorId });
    }

    return paginate(qb, dto);
  }

  findOne(id: number) {
    return `This action returns a #${id} vendorProduct`;
  }

  update(id: number, updateVendorProductDto: UpdateVendorProductDto) {
    return `This action updates a #${id} vendorProduct`;
  }

  async remove(id: number, vendorId: number, role?: string) {
    const product = await this.productRepo.findOne({ where: { id }, relations: ['vendor'] });
    if (!product) throw new NotFoundException('Product not found');
    const isVendor = role?.toLowerCase() === 'vendor';
    if (isVendor && (!product.vendor || product.vendor.id !== vendorId)) {
      throw new ForbiddenException('You can only delete your own products');
    }
    try {
      await this.productRepo.remove(product);
      return { message: 'Product deleted successfully' };
    } catch (error) {
      // MySQL foreign key constraint error
      if (
        error &&
        (error.code === 'ER_ROW_IS_REFERENCED_2' ||
          (error.driverError && error.driverError.code === 'ER_ROW_IS_REFERENCED_2'))
      ) {
        throw new ForbiddenException('Cannot delete product: it is referenced by other records (e.g., price logs).');
      }
      throw error;
    }
  }
}
