// src/marketing-content/marketing-content.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, Between } from 'typeorm';
import { MarketingContent } from './entities/marketing-content.entity';
import { CreateMarketingContentDto } from './dto/create-marketing-content.dto';
import { UpdateMarketingContentDto } from './dto/update-marketing-content.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { Categories } from 'src/categories/categories.entity';
import { Product } from 'src/products/entities/product.entity';
import { Vendor } from 'src/vendor/entities/vendor.entity';
import { MarketingLike, MarketingSave, MarketingShare, MarketingComment } from './interactions/interactions.entity';

@Injectable()
export class MarketingContentService {
  constructor(
    @InjectRepository(MarketingContent)
    private readonly marketingRepo: Repository<MarketingContent>,
    @InjectRepository(MarketingLike)
    private readonly likeRepo: Repository<MarketingLike>,
    @InjectRepository(MarketingSave)
    private readonly saveRepo: Repository<MarketingSave>,
    @InjectRepository(MarketingShare)
    private readonly shareRepo: Repository<MarketingShare>,
    @InjectRepository(MarketingComment)
    private readonly commentRepo: Repository<MarketingComment>,
    private readonly fileUploadService: FileUploadService,
  ) { }

  async create(dto: CreateMarketingContentDto, files?: Express.Multer.File[]) {
    const content = new MarketingContent();
    content.category = { id: dto.categoryId } as Categories;
    if (dto.productId) content.product = { id: dto.productId } as Product;
    if (dto.vendorId) content.vendor = { id: dto.vendorId } as Vendor;
    content.description = dto.description;

    await this.marketingRepo.save(content);

    if (files?.length) {
      await this.fileUploadService.saveFilesForMarketing(files, content.id);
    }

    return this.findOne(content.id);
  }

  async findAll(userId?: number, userRole?: string) {
    const contents = await this.marketingRepo.find({
      relations: ['media', 'product', 'vendor'],
      order: { id: 'DESC' }
    });


    return this.enrichContents(contents, userId, userRole);

  }

  async getSavedPosts(userId: number, userRole: string) {
    console.log(`[getSavedPosts] User: ${userId}, Role: ${userRole}`);
    const normalizedRole = userRole?.trim().toLowerCase();

    // 1. Get Saved IDs
    let savedRecords: any[] = [];
    try {
      if (normalizedRole === 'customer') {
        savedRecords = await this.saveRepo.find({
          where: { customer: { id: userId } },
          relations: ['marketingContent']
        });
      } else {
        savedRecords = await this.saveRepo.find({
          where: { user: { id: userId } },
          relations: ['marketingContent']
        });
      }
    } catch (err) {
      console.error("[getSavedPosts] Error fetching savedRecords:", err);
      return [];
    }

    console.log(`[getSavedPosts] Found ${savedRecords.length} saved records`);

    const savedContentIds = savedRecords
      .filter(s => s.marketingContent && !isNaN(s.marketingContent.id))
      .map(s => s.marketingContent.id);

    console.log(`[getSavedPosts] Content IDs: ${savedContentIds}`);

    if (savedContentIds.length === 0) return [];

    // 2. Fetch Contents (Using QueryBuilder directly)
    try {
      const fullContents = await this.marketingRepo.createQueryBuilder('content')
        .leftJoinAndSelect('content.media', 'media')
        .leftJoinAndSelect('content.product', 'product')
        .leftJoinAndSelect('content.vendor', 'vendor')
        .whereInIds(savedContentIds)

        .orderBy('content.id', 'DESC')
        .getMany();

      return this.enrichContents(fullContents, userId, userRole);
    } catch (err) {
      console.error("[getSavedPosts] Error fetching contents:", err);
      throw err;
    }
  }

  private async enrichContents(contents: MarketingContent[], userId?: number, userRole?: string) {
    const normalizedRole = userRole?.trim().toLowerCase();
    const isCustomer = normalizedRole === 'customer';

    for (const content of contents) {
      // 1. Populate liked_by_me / saved_by_me
      if (userId && userRole) {
        let liked: any, saved: any;
        if (isCustomer) {
          // liked = await this.likeRepo.findOne({ where: { customer: { id: userId }, marketingContent: { id: content.id } } });
          saved = await this.saveRepo.findOne({ where: { customer: { id: userId }, marketingContent: { id: content.id } } });
        } else {
          // liked = await this.likeRepo.findOne({ where: { user: { id: userId }, marketingContent: { id: content.id } } });
          saved = await this.saveRepo.findOne({ where: { user: { id: userId }, marketingContent: { id: content.id } } });
        }
        (content as any).liked_by_me = false; // !!liked;
        (content as any).saved_by_me = !!saved;

      }

      // 2. Populate Comments
      const comments: any[] = await this.commentRepo.find({
        where: { marketingContent: { id: content.id } },
        relations: ['user', 'customer'],
        order: { created_at: 'ASC' }
      });

      (content as any).comments = comments.map(c => ({
        id: c.id,
        content: c.content,
        created_at: c.created_at,
        user: c.customer ? {
          firstName: c.customer.fullName?.split(' ')[0] || 'Customer',
          lastName: c.customer.fullName?.split(' ')[1] || '',
          role: 'Customer'
        } : c.user ? {
          firstName: c.user.fullName?.split(' ')[0] || 'User',
          lastName: c.user.fullName?.split(' ')[1] || '',
          role: c.user.userType?.typeName || 'Admin'
        } : { firstName: 'Unknown', lastName: '', role: 'Unknown' }
      }));
    }

    return contents;
  }

  async findOne(id: number, userId?: number, userRole?: string) {
    const content = await this.marketingRepo.findOne({
      where: { id },
      relations: ['media'],
    });
    if (!content) throw new NotFoundException('Marketing content not found');

    if (userId && userRole) {
      const normalizedRole = userRole.trim().toLowerCase();
      const isCustomer = normalizedRole === 'customer';
      let liked: any, saved: any;

      if (isCustomer) {
        // liked = await this.likeRepo.findOne({ where: { customer: { id: userId }, marketingContent: { id: content.id } } });
        saved = await this.saveRepo.findOne({ where: { customer: { id: userId }, marketingContent: { id: content.id } } });
      } else {
        // liked = await this.likeRepo.findOne({ where: { user: { id: userId }, marketingContent: { id: content.id } } });
        saved = await this.saveRepo.findOne({ where: { user: { id: userId }, marketingContent: { id: content.id } } });
      }

      (content as any).liked_by_me = false; // !!liked;
      (content as any).saved_by_me = !!saved;

    }

    // Attach comments dynamically
    const comments: any[] = await this.commentRepo.find({
      where: { marketingContent: { id } },
      relations: ['user', 'customer'],
      order: { created_at: 'ASC' }
    });

    // Normalize comments for frontend
    (content as any).comments = comments.map(c => ({
      id: c.id,
      content: c.content,
      created_at: c.created_at,
      user: c.customer ? {
        firstName: c.customer.fullName?.split(' ')[0] || 'Customer',
        lastName: c.customer.fullName?.split(' ')[1] || '',
        role: 'Customer'
      } : c.user ? {
        firstName: c.user.fullName?.split(' ')[0] || 'User',
        lastName: c.user.fullName?.split(' ')[1] || '',
        role: c.user.userType?.typeName || 'Admin'
      } : { firstName: 'Unknown', lastName: '', role: 'Unknown' }
    }));

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

  async filter(filters: { vendorId?: number; categoryId?: number; productId?: number; }) {
    const query = this.marketingRepo.createQueryBuilder('content')
      .leftJoinAndSelect('content.media', 'media')
      .leftJoin('content.vendor', 'vendor')
      .leftJoin('content.category', 'category')
      .leftJoin('content.product', 'product');

    if (filters.vendorId) query.andWhere('vendor.id = :vendorId', { vendorId: filters.vendorId });
    if (filters.categoryId) query.andWhere('category.id = :categoryId', { categoryId: filters.categoryId });
    if (filters.productId) query.andWhere('product.id = :productId', { productId: filters.productId });

    // Order by ID DESC
    query.orderBy('content.id', 'DESC');

    return query.getMany();
  }

  async count(filters: { vendorId?: number }) {
    const where: any = {};
    if (filters.vendorId) {
      where.vendor = { id: filters.vendorId };
    }
    const total = await this.marketingRepo.count({ where });

    const now = new Date();
    const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const newThisMonth = await this.marketingRepo.count({
      where: {
        ...where,
        created_at: MoreThanOrEqual(firstDayCurrentMonth),
      }
    });

    const newLastMonth = await this.marketingRepo.count({
      where: {
        ...where,
        created_at: Between(firstDayLastMonth, lastDayLastMonth),
      }
    });

    let growth = 0;
    if (newLastMonth > 0) {
      growth = ((newThisMonth - newLastMonth) / newLastMonth) * 100;
    } else if (newThisMonth > 0) {
      growth = 100;
    }

    return { total, growth: Math.round(growth), newThisMonth };
  }

  /* ================= INTERACTIONS ================= */

  //   async toggleLike(userId: number, postId: number, userRole: string) {
  //     console.log(`[ToggleLike] User: ${userId}, Role: ${userRole}, Post: ${postId}`);
  //     try {
  //       const normalizedRole = userRole?.trim().toLowerCase();

  //       // Check if post exists
  //       const post = await this.marketingRepo.findOne({ where: { id: postId } });
  //       if (!post) throw new NotFoundException('Post not found');

  //       // Build query criteria
  //       const criteria: any = { marketingContent: { id: postId } };
  //       if (normalizedRole === 'customer') {
  //         criteria.customer = { id: userId };
  //       } else {
  //         criteria.user = { id: userId };
  //       }

  //       const existing = await this.likeRepo.findOne({ where: criteria });

  //       if (existing) {
  //         await this.likeRepo.remove(existing);
  //         post.likes_count = Math.max(0, post.likes_count - 1);
  //         await this.marketingRepo.save(post);
  //         return { liked: false, count: post.likes_count };
  //       }

  //       // Create new like
  //       const newLike = this.likeRepo.create({ marketingContent: post });
  //       if (normalizedRole === 'customer') {
  //         newLike.customer = { id: userId } as any;
  //       } else {
  //         newLike.user = { id: userId } as any;
  //       }

  //       await this.likeRepo.save(newLike);

  //       post.likes_count += 1;
  //       await this.marketingRepo.save(post);
  //       return { liked: true, count: post.likes_count };
  //     } catch (error) {
  //       console.error(`[ToggleLike] Error:`, error);
  //       throw new ForbiddenException(`Like failed: ${error.message}`);
  //     }
  //   }


  async toggleSave(userId: number, postId: number, userRole: string) {
    const post = await this.marketingRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const normalizedRole = userRole?.trim().toLowerCase();
    const criteria: any = { marketingContent: { id: postId } };

    if (normalizedRole === 'customer') {
      criteria.customer = { id: userId };
    } else {
      criteria.user = { id: userId };
    }

    const existing = await this.saveRepo.findOne({ where: criteria });

    if (existing) {
      await this.saveRepo.remove(existing);
      post.saves_count = Math.max(0, post.saves_count - 1);
      await this.marketingRepo.save(post);
      return { saved: false, count: post.saves_count };
    }

    const newSave = this.saveRepo.create({ marketingContent: post });
    if (normalizedRole === 'customer') {
      newSave.customer = { id: userId } as any;
    } else {
      newSave.user = { id: userId } as any;
    }

    await this.saveRepo.save(newSave);
    post.saves_count += 1;
    await this.marketingRepo.save(post);
    return { saved: true, count: post.saves_count };
  }

  async incrementShare(postId: number, userId?: number, userRole?: string) {
    const post = await this.marketingRepo.findOne({ where: { id: postId } });
    if (post) {
      post.shares_count += 1;
      await this.marketingRepo.save(post);

      if (userId) {
        const share = this.shareRepo.create({ marketingContent: post });
        const normalizedRole = userRole?.trim().toLowerCase();
        if (normalizedRole === 'customer') {
          share.customer = { id: userId } as any;
        } else {
          share.user = { id: userId } as any;
        }
        await this.shareRepo.save(share);
      }
    }
  }

  async addComment(userId: number, postId: number, userRole: string, content: string) {
    const post = await this.marketingRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const comment = this.commentRepo.create({
      content,
      marketingContent: post
    });

    const normalizedRole = userRole?.trim().toLowerCase();
    if (normalizedRole === 'customer') {
      comment.customer = { id: userId } as any;
    } else {
      comment.user = { id: userId } as any;
    }

    await this.commentRepo.save(comment);

    post.comments_count += 1;
    await this.marketingRepo.save(post);

    // Return with user info manually since we might have customer
    const saved = await this.commentRepo.findOne({
      where: { id: comment.id },
      relations: ['user', 'customer']
    });
    return saved;
  }

  async deleteComment(commentId: number) {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
      relations: ['marketingContent']
    });

    if (!comment) throw new NotFoundException('Comment not found');

    const postId = comment.marketingContent.id;
    await this.commentRepo.remove(comment);

    const post = await this.marketingRepo.findOne({ where: { id: postId } });
    if (post) {
      post.comments_count = Math.max(0, post.comments_count - 1);
      await this.marketingRepo.save(post);
    }

    return { success: true };
  }

  //   async getLikes(postId: number) {
  //     const likes = await this.likeRepo.find({
  //       where: { marketingContent: { id: postId } },
  //       relations: ['user', 'customer'],
  //     });

  //     return likes.map(like => {
  //       if (like.user) {
  //         return {
  //           id: like.user.id,
  //           firstName: like.user.fullName?.split(' ')[0] || 'User',
  //           lastName: like.user.fullName?.split(' ')[1] || '',
  //           role: like.user.userType?.typeName || 'Admin' // Assuming user is admin/vendor
  //         };
  //       } else if (like.customer) {
  //         return {
  //           id: like.customer.id,
  //           firstName: like.customer.fullName?.split(' ')[0] || 'Customer',
  //           lastName: like.customer.fullName?.split(' ')[1] || '',
  //           role: 'Customer'
  //         };
  //       } else {
  //         return { id: 0, firstName: 'Unknown', lastName: '', role: 'Unknown' };
  //       }
  //     });
  //   }

}
