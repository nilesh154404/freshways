import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDiscountDto } from './dto/create-product-discount.dto';
import { UpdateProductDiscountDto } from './dto/update-product-discount.dto';
import { DiscountType } from './entities/discount-type.enum';
import { ProductDiscount } from './entities/product-discount.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class ProductDiscountService {
  constructor(
    @InjectRepository(ProductDiscount)
    private readonly discountRepo: Repository<ProductDiscount>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>
  ) {}

  /** Calculate final price for a product with discount */
  public calculatePrice(
    basePrice: number,
    quantity: number,
    discount?: ProductDiscount
  ): { finalTotal: number; freeItems?: number } {
    if (!discount) return { finalTotal: basePrice * quantity };

    switch (discount.type) {
      case DiscountType.PERCENTAGE:
        return { finalTotal: basePrice * quantity * (1 - discount.value / 100) };

      case DiscountType.FLAT:
        return { finalTotal: Math.max(basePrice * quantity - discount.value, 0) };

      case DiscountType.BOGO:
        if (!discount.buyQuantity || !discount.getQuantity) return { finalTotal: basePrice * quantity };
        const groupSize = discount.buyQuantity + discount.getQuantity;
        const eligibleGroups = Math.floor(quantity / groupSize);
        const freeItems = eligibleGroups * discount.getQuantity;
        const payableQty = quantity - freeItems;
        return { finalTotal: payableQty * basePrice, freeItems };

      default:
        return { finalTotal: basePrice * quantity };
    }
  }

  /** Create a new product discount */
  async create(dto: CreateProductDiscountDto): Promise<ProductDiscount> {
    const product = await this.productRepo.findOneBy({ id: dto.productId });
    if (!product) throw new NotFoundException(`Product with id ${dto.productId} not found`);

    const discount = this.discountRepo.create({ ...dto, product });
    return this.discountRepo.save(discount);
  }

  /** Get all product discounts */
  async findAll(): Promise<ProductDiscount[]> {
    return this.discountRepo.find({ relations: ['product'] });
  }

  /** Get one discount by id */
  async findOne(id: number): Promise<ProductDiscount> {
    const discount = await this.discountRepo.findOne({ where: { id }, relations: ['product'] });
    if (!discount) throw new NotFoundException(`Discount with id ${id} not found`);
    return discount;
  }

  /** Update a discount */
  async update(id: number, dto: UpdateProductDiscountDto): Promise<ProductDiscount> {
    const discount = await this.findOne(id);

    // If productId is updated
    if (dto.productId) {
      const product = await this.productRepo.findOneBy({ id: dto.productId });
      if (!product) throw new NotFoundException(`Product with id ${dto.productId} not found`);
      discount.product = product;
    }

    Object.assign(discount, dto);
    return this.discountRepo.save(discount);
  }

  /** Remove a discount */
  async remove(id: number): Promise<void> {
    const discount = await this.findOne(id);
    await this.discountRepo.remove(discount);
  }
}

// import { Injectable } from '@nestjs/common';
// import { CreateProductDiscountDto } from './dto/create-product-discount.dto';
// import { UpdateProductDiscountDto } from './dto/update-product-discount.dto';
// import { DiscountType } from './entities/discount-type.enum';
// import { ProductDiscount } from './entities/product-discount.entity';

// @Injectable()
// export class ProductDiscountService {
  
//   public calculatePrice(
//     basePrice: number,
//     quantity: number,
//     discount?: ProductDiscount
//   ): { finalTotal: number; freeItems?: number } {
//     if (!discount) return { finalTotal: basePrice * quantity };

//     switch (discount.type) {
//       case DiscountType.PERCENTAGE:
//         return { finalTotal: basePrice * quantity * (1 - discount.value / 100) };

//       case DiscountType.FLAT:
//         return { finalTotal: Math.max(basePrice * quantity - discount.value, 0) };

//       case DiscountType.BOGO:
//         if (!discount.buyQuantity || !discount.getQuantity) {
//           return { finalTotal: basePrice * quantity };
//         }
//         const groupSize = discount.buyQuantity + discount.getQuantity;
//         const eligibleGroups = Math.floor(quantity / groupSize);
//         const freeItems = eligibleGroups * discount.getQuantity;
//         const payableQty = quantity - freeItems;
//         return { finalTotal: payableQty * basePrice, freeItems };

//       default:
//         return { finalTotal: basePrice * quantity };
//     }
//   }

//   create(createProductDiscountDto: CreateProductDiscountDto) {
//     return 'This action adds a new productDiscount';
//   }

//   findAll() {
//     return `This action returns all productDiscount`;
//   }

//   findOne(id: number) {
//     return `This action returns a #${id} productDiscount`;
//   }

//   update(id: number, updateProductDiscountDto: UpdateProductDiscountDto) {
//     return `This action updates a #${id} productDiscount`;
//   }

//   remove(id: number) {
//     return `This action removes a #${id} productDiscount`;
//   }
// }
