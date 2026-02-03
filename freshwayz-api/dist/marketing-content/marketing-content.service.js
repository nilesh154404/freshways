"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketingContentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const marketing_content_entity_1 = require("./entities/marketing-content.entity");
const file_upload_service_1 = require("../file-upload/file-upload.service");
const interactions_entity_1 = require("./interactions/interactions.entity");
let MarketingContentService = class MarketingContentService {
    marketingRepo;
    likeRepo;
    saveRepo;
    shareRepo;
    commentRepo;
    fileUploadService;
    constructor(marketingRepo, likeRepo, saveRepo, shareRepo, commentRepo, fileUploadService) {
        this.marketingRepo = marketingRepo;
        this.likeRepo = likeRepo;
        this.saveRepo = saveRepo;
        this.shareRepo = shareRepo;
        this.commentRepo = commentRepo;
        this.fileUploadService = fileUploadService;
    }
    async create(dto, files) {
        const content = new marketing_content_entity_1.MarketingContent();
        content.category = { id: dto.categoryId };
        if (dto.productId)
            content.product = { id: dto.productId };
        if (dto.vendorId)
            content.vendor = { id: dto.vendorId };
        content.description = dto.description;
        await this.marketingRepo.save(content);
        if (files?.length) {
            await this.fileUploadService.saveFilesForMarketing(files, content.id);
        }
        return this.findOne(content.id);
    }
    async findAll(userId, userRole) {
        const contents = await this.marketingRepo.find({
            relations: ['media', 'product'],
            order: { id: 'DESC' }
        });
        return this.enrichContents(contents, userId, userRole);
    }
    async getSavedPosts(userId, userRole) {
        console.log(`[getSavedPosts] User: ${userId}, Role: ${userRole}`);
        const normalizedRole = userRole?.trim().toLowerCase();
        let savedRecords = [];
        try {
            if (normalizedRole === 'customer') {
                savedRecords = await this.saveRepo.find({
                    where: { customer: { id: userId } },
                    relations: ['marketingContent']
                });
            }
            else {
                savedRecords = await this.saveRepo.find({
                    where: { user: { id: userId } },
                    relations: ['marketingContent']
                });
            }
        }
        catch (err) {
            console.error("[getSavedPosts] Error fetching savedRecords:", err);
            return [];
        }
        console.log(`[getSavedPosts] Found ${savedRecords.length} saved records`);
        const savedContentIds = savedRecords
            .filter(s => s.marketingContent && !isNaN(s.marketingContent.id))
            .map(s => s.marketingContent.id);
        console.log(`[getSavedPosts] Content IDs: ${savedContentIds}`);
        if (savedContentIds.length === 0)
            return [];
        try {
            const fullContents = await this.marketingRepo.createQueryBuilder('content')
                .leftJoinAndSelect('content.media', 'media')
                .leftJoinAndSelect('content.product', 'product')
                .whereInIds(savedContentIds)
                .orderBy('content.id', 'DESC')
                .getMany();
            return this.enrichContents(fullContents, userId, userRole);
        }
        catch (err) {
            console.error("[getSavedPosts] Error fetching contents:", err);
            throw err;
        }
    }
    async enrichContents(contents, userId, userRole) {
        const normalizedRole = userRole?.trim().toLowerCase();
        const isCustomer = normalizedRole === 'customer';
        for (const content of contents) {
            if (userId && userRole) {
                let liked, saved;
                if (isCustomer) {
                    liked = await this.likeRepo.findOne({ where: { customer: { id: userId }, marketingContent: { id: content.id } } });
                    saved = await this.saveRepo.findOne({ where: { customer: { id: userId }, marketingContent: { id: content.id } } });
                }
                else {
                    liked = await this.likeRepo.findOne({ where: { user: { id: userId }, marketingContent: { id: content.id } } });
                    saved = await this.saveRepo.findOne({ where: { user: { id: userId }, marketingContent: { id: content.id } } });
                }
                content.liked_by_me = !!liked;
                content.saved_by_me = !!saved;
            }
            const comments = await this.commentRepo.find({
                where: { marketingContent: { id: content.id } },
                relations: ['user', 'customer'],
                order: { created_at: 'ASC' }
            });
            content.comments = comments.map(c => ({
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
    async findOne(id, userId, userRole) {
        const content = await this.marketingRepo.findOne({
            where: { id },
            relations: ['media'],
        });
        if (!content)
            throw new common_1.NotFoundException('Marketing content not found');
        if (userId && userRole) {
            const normalizedRole = userRole.trim().toLowerCase();
            const isCustomer = normalizedRole === 'customer';
            let liked, saved;
            if (isCustomer) {
                liked = await this.likeRepo.findOne({ where: { customer: { id: userId }, marketingContent: { id: content.id } } });
                saved = await this.saveRepo.findOne({ where: { customer: { id: userId }, marketingContent: { id: content.id } } });
            }
            else {
                liked = await this.likeRepo.findOne({ where: { user: { id: userId }, marketingContent: { id: content.id } } });
                saved = await this.saveRepo.findOne({ where: { user: { id: userId }, marketingContent: { id: content.id } } });
            }
            content.liked_by_me = !!liked;
            content.saved_by_me = !!saved;
        }
        const comments = await this.commentRepo.find({
            where: { marketingContent: { id } },
            relations: ['user', 'customer'],
            order: { created_at: 'ASC' }
        });
        content.comments = comments.map(c => ({
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
    async update(id, dto, files) {
        const content = await this.marketingRepo.preload({ id, ...dto });
        if (!content)
            throw new common_1.NotFoundException('Marketing content not found');
        await this.marketingRepo.save(content);
        if (files?.length) {
            await this.fileUploadService.saveFilesForMarketing(files, content.id);
        }
        return this.findOne(content.id);
    }
    async remove(id) {
        const content = await this.findOne(id);
        return this.marketingRepo.remove(content);
    }
    async filter(filters) {
        const query = this.marketingRepo.createQueryBuilder('content')
            .leftJoinAndSelect('content.media', 'media')
            .leftJoin('content.vendor', 'vendor')
            .leftJoin('content.category', 'category')
            .leftJoin('content.product', 'product');
        if (filters.vendorId)
            query.andWhere('vendor.id = :vendorId', { vendorId: filters.vendorId });
        if (filters.categoryId)
            query.andWhere('category.id = :categoryId', { categoryId: filters.categoryId });
        if (filters.productId)
            query.andWhere('product.id = :productId', { productId: filters.productId });
        query.orderBy('content.id', 'DESC');
        return query.getMany();
    }
    async toggleLike(userId, postId, userRole) {
        console.log(`[ToggleLike] User: ${userId}, Role: ${userRole}, Post: ${postId}`);
        try {
            const normalizedRole = userRole?.trim().toLowerCase();
            const post = await this.marketingRepo.findOne({ where: { id: postId } });
            if (!post)
                throw new common_1.NotFoundException('Post not found');
            const criteria = { marketingContent: { id: postId } };
            if (normalizedRole === 'customer') {
                criteria.customer = { id: userId };
            }
            else {
                criteria.user = { id: userId };
            }
            const existing = await this.likeRepo.findOne({ where: criteria });
            if (existing) {
                await this.likeRepo.remove(existing);
                post.likes_count = Math.max(0, post.likes_count - 1);
                await this.marketingRepo.save(post);
                return { liked: false, count: post.likes_count };
            }
            const newLike = this.likeRepo.create({ marketingContent: post });
            if (normalizedRole === 'customer') {
                newLike.customer = { id: userId };
            }
            else {
                newLike.user = { id: userId };
            }
            await this.likeRepo.save(newLike);
            post.likes_count += 1;
            await this.marketingRepo.save(post);
            return { liked: true, count: post.likes_count };
        }
        catch (error) {
            console.error(`[ToggleLike] Error:`, error);
            throw new common_1.ForbiddenException(`Like failed: ${error.message}`);
        }
    }
    async toggleSave(userId, postId, userRole) {
        const post = await this.marketingRepo.findOne({ where: { id: postId } });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        const normalizedRole = userRole?.trim().toLowerCase();
        const criteria = { marketingContent: { id: postId } };
        if (normalizedRole === 'customer') {
            criteria.customer = { id: userId };
        }
        else {
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
            newSave.customer = { id: userId };
        }
        else {
            newSave.user = { id: userId };
        }
        await this.saveRepo.save(newSave);
        post.saves_count += 1;
        await this.marketingRepo.save(post);
        return { saved: true, count: post.saves_count };
    }
    async incrementShare(postId, userId, userRole) {
        const post = await this.marketingRepo.findOne({ where: { id: postId } });
        if (post) {
            post.shares_count += 1;
            await this.marketingRepo.save(post);
            if (userId) {
                const share = this.shareRepo.create({ marketingContent: post });
                const normalizedRole = userRole?.trim().toLowerCase();
                if (normalizedRole === 'customer') {
                    share.customer = { id: userId };
                }
                else {
                    share.user = { id: userId };
                }
                await this.shareRepo.save(share);
            }
        }
    }
    async addComment(userId, postId, userRole, content) {
        const post = await this.marketingRepo.findOne({ where: { id: postId } });
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        const comment = this.commentRepo.create({
            content,
            marketingContent: post
        });
        const normalizedRole = userRole?.trim().toLowerCase();
        if (normalizedRole === 'customer') {
            comment.customer = { id: userId };
        }
        else {
            comment.user = { id: userId };
        }
        await this.commentRepo.save(comment);
        post.comments_count += 1;
        await this.marketingRepo.save(post);
        const saved = await this.commentRepo.findOne({
            where: { id: comment.id },
            relations: ['user', 'customer']
        });
        return saved;
    }
    async deleteComment(commentId) {
        const comment = await this.commentRepo.findOne({
            where: { id: commentId },
            relations: ['marketingContent']
        });
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        const postId = comment.marketingContent.id;
        await this.commentRepo.remove(comment);
        const post = await this.marketingRepo.findOne({ where: { id: postId } });
        if (post) {
            post.comments_count = Math.max(0, post.comments_count - 1);
            await this.marketingRepo.save(post);
        }
        return { success: true };
    }
    async getLikes(postId) {
        const likes = await this.likeRepo.find({
            where: { marketingContent: { id: postId } },
            relations: ['user', 'customer'],
        });
        return likes.map(like => {
            if (like.user) {
                return {
                    id: like.user.id,
                    firstName: like.user.fullName?.split(' ')[0] || 'User',
                    lastName: like.user.fullName?.split(' ')[1] || '',
                    role: like.user.userType?.typeName || 'Admin'
                };
            }
            else if (like.customer) {
                return {
                    id: like.customer.id,
                    firstName: like.customer.fullName?.split(' ')[0] || 'Customer',
                    lastName: like.customer.fullName?.split(' ')[1] || '',
                    role: 'Customer'
                };
            }
            else {
                return { id: 0, firstName: 'Unknown', lastName: '', role: 'Unknown' };
            }
        });
    }
};
exports.MarketingContentService = MarketingContentService;
exports.MarketingContentService = MarketingContentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(marketing_content_entity_1.MarketingContent)),
    __param(1, (0, typeorm_1.InjectRepository)(interactions_entity_1.MarketingLike)),
    __param(2, (0, typeorm_1.InjectRepository)(interactions_entity_1.MarketingSave)),
    __param(3, (0, typeorm_1.InjectRepository)(interactions_entity_1.MarketingShare)),
    __param(4, (0, typeorm_1.InjectRepository)(interactions_entity_1.MarketingComment)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        file_upload_service_1.FileUploadService])
], MarketingContentService);
//# sourceMappingURL=marketing-content.service.js.map