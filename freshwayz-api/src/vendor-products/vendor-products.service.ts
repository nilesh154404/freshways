import { Injectable } from '@nestjs/common';
import { CreateVendorProductDto } from './dto/create-vendor-product.dto';
import { UpdateVendorProductDto } from './dto/update-vendor-product.dto';

@Injectable()
export class VendorProductsService {
  create(createVendorProductDto: CreateVendorProductDto) {
    return 'This action adds a new vendorProduct';
  }

  findAll() {
    return `This action returns all vendorProducts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} vendorProduct`;
  }

  update(id: number, updateVendorProductDto: UpdateVendorProductDto) {
    return `This action updates a #${id} vendorProduct`;
  }

  remove(id: number) {
    return `This action removes a #${id} vendorProduct`;
  }
}
