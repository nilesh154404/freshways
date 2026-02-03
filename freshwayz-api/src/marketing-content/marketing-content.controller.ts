// src/marketing-content/marketing-content.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { MarketingContentService } from './marketing-content.service';
import { CreateMarketingContentDto } from './dto/create-marketing-content.dto';
import { UpdateMarketingContentDto } from './dto/update-marketing-content.dto';
import { multerConfig } from './multer.config';
// Assuming JwtAuthGuard exists in your project structure relative to this file
// If not found, please check src/auth/guards/jwt-auth.guard.ts
// I'll assume standard path or try to import from auth module if exported.
// For now, I will use a generic placeholder or try to find it. 
// Let's assume global Auth availability or imports.
// Wait, I can't guess the Guard import. Let's look for it first if it fails.
// For now I'll assume it's publicly accessible or handled via custom decorator?
// The user mentions "Admins/Vendors login", so Authentication is definitely there.
// I will import JwtAuthGuard from 'src/auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/auth/guards/optional-jwt-auth.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Marketing Content')
@Controller('marketing')
export class MarketingContentController {
  constructor(private readonly marketingService: MarketingContentService) { }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'media_files', maxCount: 10 }],
      multerConfig
    )
  )
  async create(
    @Body() dto: any,
    @UploadedFiles() files: { media_files?: Express.Multer.File[] }
  ) {
    const data = {
      ...dto,
      categoryId: Number(dto.categoryId),
      productId: dto.productId ? Number(dto.productId) : undefined,
      vendorId: dto.vendorId ? Number(dto.vendorId) : undefined,
    };

    return this.marketingService.create(data, files?.media_files);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('saved')
  async getSavedPosts(@Req() req: any) {
    const userId = req.user.profileId || req.user.sub;
    const role = req.user.role;
    return this.marketingService.getSavedPosts(userId, role);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async findAll(@Query('vendorId') vendorId?: number,
    @Query('categoryId') categoryId?: number,
    @Query('productId') productId?: number,
    @Req() req?: any) {
    if (vendorId || categoryId || productId) {
      return this.marketingService.filter({ vendorId, categoryId, productId });
    }
    const userId = req?.user?.profileId || req?.user?.sub;
    const role = req?.user?.role;
    return this.marketingService.findAll(userId, role);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: number, @Req() req?: any) {
    const userId = req?.user?.profileId || req?.user?.sub;
    const role = req?.user?.role;
    return this.marketingService.findOne(id, userId, role);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/like')
  async toggleLike(@Param('id') id: number, @Req() req: any) {
    const userId = req.user.profileId || req.user.sub;
    return this.marketingService.toggleLike(userId, id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/save')
  async toggleSave(@Param('id') id: number, @Req() req: any) {
    const userId = req.user.profileId || req.user.sub;
    return this.marketingService.toggleSave(userId, id, req.user.role);
  }

  @Post(':id/share')
  // @UseGuards(JwtAuthGuard) // Make public so count always works
  async incrementShare(@Param('id') id: number, @Req() req: any) {
    // If we want to track user, we'd need to manually decode token here or use a permissive guard.
    // For now, prioritize the Counter working.
    const userId = req.user?.profileId || req.user?.sub;
    return this.marketingService.incrementShare(id, userId, req.user?.role);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/comments')
  async addComment(@Param('id') id: number, @Body('content') content: string, @Req() req: any) {
    const userId = req.user.profileId || req.user.sub;
    return this.marketingService.addComment(userId, id, req.user.role, content);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('comments/:commentId')
  async deleteComment(@Param('commentId') commentId: number, @Req() req: any) {
    const role = req.user.role;
    if (role !== 'Admin' && role !== 'Vendor') {
      throw new ForbiddenException('Only Admins and Vendors can delete comments');
    }
    return this.marketingService.deleteComment(commentId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id/likes')
  async getLikes(@Param('id') id: number, @Req() req: any) {
    // User requested: "customer can only see who liked and commented"
    // So we allow everyone logged in to see the likes list.
    return this.marketingService.getLikes(id);
  }

}
