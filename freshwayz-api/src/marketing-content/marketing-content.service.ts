import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarketingContent } from './entities/marketing-content.entity';
import { MarketingSave } from './entities/marketing-save.entity';
import { MarketingComment } from './entities/marketing-comment.entity';
import { MarketingReport } from './entities/marketing-report.entity';
import { CustomerVendorBlock } from './entities/customer-vendor-block.entity';
import { CreateMarketingContentDto } from './dto/create-marketing-content.dto';
import { UpdateMarketingContentDto } from './dto/update-marketing-content.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { FileUpload } from 'src/file-upload/entities/file-upload.entity';
import { Categories } from 'src/categories/categories.entity';
import { Product } from 'src/products/entities/product.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { Customer } from 'src/customer/entities/customer.entity';

@Injectable()
export class MarketingContentService {
  constructor(
    @InjectRepository(MarketingContent)
    private readonly marketingRepo: Repository<MarketingContent>,
    @InjectRepository(MarketingSave)
    private readonly saveRepo: Repository<MarketingSave>,
    @InjectRepository(MarketingComment)
    private readonly commentRepo: Repository<MarketingComment>,
    @InjectRepository(MarketingReport)
    private readonly reportRepo: Repository<MarketingReport>,
    @InjectRepository(CustomerVendorBlock)
    private readonly blockRepo: Repository<CustomerVendorBlock>,
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
      relations: ['category', 'product', 'product.dailyPrices', 'vendor', 'media'],
    });
  }

  findAll(customerId?: number) {
    const query = this.marketingRepo.createQueryBuilder('content')
      .leftJoinAndSelect('content.media', 'media')
      .leftJoinAndSelect('content.product', 'product')
      .leftJoinAndSelect('product.dailyPrices', 'dailyPrices')
      .leftJoinAndSelect('content.vendor', 'vendor')
      .leftJoinAndSelect('content.category', 'category')
      .leftJoinAndSelect('content.saves', 'saves')
      .leftJoinAndSelect('content.comments', 'comments')
      .orderBy('content.id', 'DESC');

    if (customerId) {
      // Exclude posts this customer has reported
      query.where(qb => {
        const sub = qb.subQuery()
          .select('r.marketing_content_id')
          .from('marketing_reports', 'r')
          .where('r.customer_id = :customerId', { customerId })
          .getQuery();
        return `content.id NOT IN ${sub}`;
      });
      // Exclude posts from blocked vendors
      query.andWhere(qb => {
        const sub = qb.subQuery()
          .select('b.vendorId')
          .from('customer_vendor_blocks', 'b')
          .where('b.customerId = :customerId', { customerId })
          .getQuery();
        return `(vendor.id IS NULL OR vendor.id NOT IN ${sub})`;
      });
    }

    return query.getMany();
  }

  async findOne(id: number) {
    const content = await this.marketingRepo.findOne({
      where: { id },
      relations: ['media', 'comments'],
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
    customerId?: number;
  }) {
    const query = this.marketingRepo
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.media', 'media')
      .leftJoinAndSelect('content.vendor', 'vendor')
      .leftJoinAndSelect('content.category', 'category')
      .leftJoinAndSelect('content.product', 'product')
      .leftJoinAndSelect('product.dailyPrices', 'dailyPrices')
      .leftJoinAndSelect('content.comments', 'comments')
      .leftJoinAndSelect('content.likes', 'likes')
      .leftJoinAndSelect('content.saves', 'saves')
      .leftJoinAndSelect('likes.user', 'likeUser')
      .orderBy('content.id', 'DESC');

    if (filters.customerId) {
      // Exclude posts reported by this customer
      query.andWhere(qb => {
        const sub = qb.subQuery()
          .select('r.marketing_content_id')
          .from('marketing_reports', 'r')
          .where('r.customer_id = :cid', { cid: filters.customerId })
          .getQuery();
        return `content.id NOT IN ${sub}`;
      });
      // Exclude posts from blocked vendors
      query.andWhere(qb => {
        const sub = qb.subQuery()
          .select('b.vendorId')
          .from('customer_vendor_blocks', 'b')
          .where('b.customerId = :cid', { cid: filters.customerId })
          .getQuery();
        return `(vendor.id IS NULL OR vendor.id NOT IN ${sub})`;
      });
    }

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

  // Toggle save functionality
  async toggleSave(contentId: number, userId: number, userType: string) {
    const content = await this.marketingRepo.findOne({ where: { id: contentId } });
    if (!content) throw new NotFoundException('Marketing content not found');

    const existingSave = await this.saveRepo.findOne({
      where: {
        marketingContent: { id: contentId },
        userId,
        userType,
      },
    });

    if (existingSave) {
      // Unsave
      await this.saveRepo.remove(existingSave);
      return { message: 'Post unsaved successfully', saved: false };
    } else {
      // Save
      const newSave = this.saveRepo.create({
        userId,
        userType,
        marketingContent: content,
      });
      await this.saveRepo.save(newSave);
      return { message: 'Post saved successfully', saved: true };
    }
  }

  // Add comment to a post
  async addComment(contentId: number, text: string, userId: number, userType: string) {
    const content = await this.marketingRepo.findOne({ where: { id: contentId } });
    if (!content) throw new NotFoundException('Marketing content not found');

    const comment = this.commentRepo.create({
      text,
      userId,
      userType,
      marketingContent: content,
    });

    await this.commentRepo.save(comment);
    return { message: 'Comment added successfully', comment };
  }

  // Delete comment
  async deleteComment(commentId: number) {
    const comment = await this.commentRepo.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');

    await this.commentRepo.remove(comment);
    return { message: 'Comment deleted successfully' };
  }

  // Increment share count
  // async incrementShare(contentId: number) {
  //   const content = await this.marketingRepo.findOne({ where: { id: contentId } });
  //   if (!content) throw new NotFoundException('Marketing content not found');

  //   content.shareCount = (content.shareCount || 0) + 1;
  //   await this.marketingRepo.save(content);

  //   return { message: 'Share count incremented', shareCount: content.shareCount };
  // }

  async incrementShare(id: number) {
    const post = await this.marketingRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException("Post not found");

    post.shareCount += 1;
    await this.marketingRepo.save(post);

    return {
      deepLink: `http://localhost:8080/post/${id}`, // ✅ WEB URL
      // const deepLink = `freshwayz://marketing-content?id=${id}`;
    };
  }

  // Get saved posts for a user
  async getSavedPosts(userId: number) {
    const savedPosts = await this.saveRepo.find({
      where: { userId },
      relations: ['marketingContent', 'marketingContent.media', 'marketingContent.vendor', 'marketingContent.category', 'marketingContent.comments', 'marketingContent.saves'],
      order: { createdAt: 'DESC' },
    });

    return savedPosts.map(save => save.marketingContent);
  }

  // Get all comments by a particular customer
  async getCommentsByCustomer(userId: number) {
    const comments = await this.commentRepo.find({
      where: { userId },
      relations: ['marketingContent'],
      order: { createdAt: 'DESC' },
    });
    return comments;
  }

  // ======================== REPORT METHODS ========================

  // Customer reports a post
  async reportPost(postId: number, customerId: number, reason: string) {
    const content = await this.marketingRepo.findOne({ where: { id: postId } });
    if (!content) throw new NotFoundException('Post not found');

    // Prevent duplicate reports from same customer
    const existing = await this.reportRepo.findOne({
      where: {
        marketingContent: { id: postId },
        customer: { id: customerId },
      },
    });
    if (existing) throw new BadRequestException('You have already reported this post');

    const report = this.reportRepo.create({
      marketingContent: content,
      customer: { id: customerId } as Customer,
      reason,
    });
    await this.reportRepo.save(report);
    return { message: 'Post reported successfully. It will no longer appear in your feed.' };
  }

  // Get all reports on a specific post (Vendor + Admin)
  async getReportsByPost(postId: number) {
    return this.reportRepo.find({
      where: { marketingContent: { id: postId } },
      relations: ['customer', 'marketingContent'],
      order: { createdAt: 'DESC' },
    });
  }

  // Get all reports on all posts by a specific vendor (for vendor dashboard)
  async getReportsByVendor(vendorId: number) {
    return this.reportRepo
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.marketingContent', 'post')
      .leftJoinAndSelect('post.vendor', 'vendor')
      .leftJoinAndSelect('report.customer', 'customer')
      .where('vendor.id = :vendorId', { vendorId })
      .orderBy('report.createdAt', 'DESC')
      .getMany();
  }

  // Get ALL reports across all posts (Admin only)
  async getAllReports() {
    return this.reportRepo.find({
      relations: ['marketingContent', 'customer'],
      order: { createdAt: 'DESC' },
    });
  }

  // ======================== BLOCK VENDOR ========================

  async blockVendor(vendorId: number, customerId: number) {
    // Check if already blocked
    const existing = await this.blockRepo.findOne({
      where: {
        vendor: { id: vendorId },
        customer: { id: customerId }
      }
    });

    if (existing) {
      return existing; // Already blocked
    }

    const block = this.blockRepo.create({
      vendor: { id: vendorId } as Vendor,
      customer: { id: customerId } as Customer,
    });
    return this.blockRepo.save(block);
  }

}
