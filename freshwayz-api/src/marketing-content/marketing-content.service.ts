// src/marketing-content/marketing-content.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketingContent } from './entities/marketing-content.entity';
import { CreateMarketingContentDto } from './dto/create-marketing-content.dto';
import { UpdateMarketingContentDto } from './dto/update-marketing-content.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { FileUpload } from 'src/file-upload/entities/file-upload.entity';
import { Categories } from 'src/categories/categories.entity';
import { Product } from 'src/products/entities/product.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';

@Injectable()
export class MarketingContentService {
  constructor(
    @InjectRepository(MarketingContent)
    private readonly marketingRepo: Repository<MarketingContent>,
    private readonly fileUploadService: FileUploadService,
  ) { }

  // async create(dto: CreateMarketingContentDto, files?: Express.Multer.File[]) {
  //   const content = this.marketingRepo.create(dto);
  //   await this.marketingRepo.save(content);

  //   if (files?.length) {
  //     await this.fileUploadService.saveFilesForMarketing(files, content.id);
  //   }

  //   return this.findOne(content.id);
  // }

  // async create(dto: CreateMarketingContentDto, files?: Express.Multer.File[]) {
  //   const content = new MarketingContent();

  //   // Assign relations properly
  //   content.category = { id: dto.categoryId } as Categories;
  //   if (dto.productId) {
  //     content.product = { id: dto.productId } as Product;
  //   }

  //   content.description = dto.description;

  //   await this.marketingRepo.save(content);

  //   if (files?.length) {
  //     await this.fileUploadService.saveFilesForMarketing(files, content.id);
  //   }

  //   return this.marketingRepo.findOne({
  //     where: { id: content.id },
  //     relations: ['category', 'product', 'vendor', 'media'],
  //   });
  // }
  async create(
    dto: CreateMarketingContentDto,
    files?: Express.Multer.File[],
  ) {
    const content = new MarketingContent();

    content.category = { id: dto.categoryId } as Categories;

    if (dto.productId) {
      content.product = { id: dto.productId } as Product;
    }

    if (dto.vendorId) {
      content.vendor = { id: dto.vendorId } as Vendor;
    }

    content.description = dto.description;

    await this.marketingRepo.save(content);

    if (files?.length) {
      await this.fileUploadService.saveFilesForMarketing(files, content.id);
    }

    return this.marketingRepo.findOne({
      where: { id: content.id },
      relations: ['category', 'product', 'vendor', 'media'],
    });
  }

  findAll() {
    return this.marketingRepo.find({
      relations: ['media', 'product'], order: {
        id: 'DESC', // <-- order by id descending
      }
    });
  }

  async findOne(id: number) {
    const content = await this.marketingRepo.findOne({
      where: { id },
      relations: ['media'],
    });
    if (!content) throw new NotFoundException('Marketing content not found');
    return content;
  }

  async update(id: number, dto: UpdateMarketingContentDto, files?: Express.Multer.File[]) {
    const content = await this.marketingRepo.preload({ id, ...dto });
    if (!content) throw new NotFoundException('Marketing content not found');

    await this.marketingRepo.save(content);

    if (files?.length) {
      await this.fileUploadService.saveFilesForMarketing(files, content.id);
    }

    return this.findOne(content.id);
  }

  async remove(id: number) {
    const content = await this.findOne(id);
    return this.marketingRepo.remove(content);
  }

  // async filter(filters: {
  //   vendorId?: number;
  //   categoryId?: number;
  //   productId?: number;
  // }) {
  //   const query = this.marketingRepo.createQueryBuilder('marketing_contents').leftJoinAndSelect('marketing_contents.media', 'media');

  //   if (filters.vendorId) query.andWhere('marketing_contents.vendorId = :vendorId', { vendorId: filters.vendorId });
  //   if (filters.categoryId) query.andWhere('marketing_contents.categoryId = :categoryId', { categoryId: filters.categoryId });
  //   if (filters.productId) query.andWhere('marketing_contents.productId = :productId', { productId: filters.productId });

  //   return query.getMany();
  // }

  async filter(filters: {
    vendorId?: number;
    categoryId?: number;
    productId?: number;
  }) {
    const query = this.marketingRepo
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.media', 'media')
      .leftJoin('content.vendor', 'vendor')
      // .leftJoin('content.category', 'category')
      .leftJoin('content.product', 'product');

    if (filters.vendorId) {
      query.andWhere('vendor.id = :vendorId', {
        vendorId: filters.vendorId,
      });
    }

    if (filters.categoryId) {
      query.andWhere('category.id = :categoryId', {
        categoryId: filters.categoryId,
      });
    }

    if (filters.productId) {
      query.andWhere('product.id = :productId', {
        productId: filters.productId,
      });
    }

    return query.getMany();
  }
  // async filter(filters: {
  //   vendorId?: number;
  //   categoryId?: number;
  //   productId?: number;
  // }) {
  //   const query = this.marketingRepo
  //     .createQueryBuilder('content')
  //     .leftJoinAndSelect('content.media', 'media')       // eager-load media
  //     .leftJoinAndSelect('content.vendor', 'vendor')     // select vendor data
  //     // .leftJoinAndSelect('content.category', 'category') // select category data
  //     // .leftJoinAndSelect('content.product', 'product');  // select product data

  //   if (filters.vendorId) {
  //     query.andWhere('vendor.id = :vendorId', { vendorId: filters.vendorId });
  //   }

  //   if (filters.categoryId) {
  //     query.andWhere('category.id = :categoryId', { categoryId: filters.categoryId });
  //   }

  //   if (filters.productId) {
  //     query.andWhere('product.id = :productId', { productId: filters.productId });
  //   }

  //   // Order by content.id descending
  //   query.orderBy('content.id', 'DESC');

  //   return query.getMany();
  // }

}
