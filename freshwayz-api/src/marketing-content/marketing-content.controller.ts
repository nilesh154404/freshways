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
} from '@nestjs/common';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { MarketingContentService } from './marketing-content.service';
import { CreateMarketingContentDto } from './dto/create-marketing-content.dto';
import { UpdateMarketingContentDto } from './dto/update-marketing-content.dto';
import { multerConfig } from './multer.config';

@ApiTags('Marketing Content')
@Controller('marketing')
export class MarketingContentController {
  constructor(private readonly marketingService: MarketingContentService) { }

  // @Post()
  // @ApiConsumes('multipart/form-data')
  // @UseInterceptors(FileFieldsInterceptor([{ name: 'media_files', maxCount: 10 }]))
  // async create(
  //   @Body() dto: CreateMarketingContentDto,
  //   @UploadedFiles() files?: { media_files?: Express.Multer.File[] },
  // ) {
  //   return this.marketingService.create(dto, files?.media_files);
  // }
  // @Post()
  // @ApiConsumes('multipart/form-data')
  // @UseInterceptors(
  //   FileFieldsInterceptor([{ name: 'media_files', maxCount: 10 }]),
  // )
  // async create(
  //   @Body() dto: CreateMarketingContentDto,
  //   @UploadedFiles()
  //   files?: { media_files?: Express.Multer.File[] },
  // ) {
  //   // return { dto, files }
  //   return this.marketingService.create(dto, files?.media_files);
  // }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        categoryId: { type: 'number', example: 1 },
        productId: { type: 'number', example: 12 },
        description: { type: 'string', example: 'Fresh deals from our store' },
        vendorId: { type: 'number', example: 2 },
        media_files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
      required: ['categoryId', 'description'],
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'media_files', maxCount: 10 }],
      multerConfig // ✅ HERE
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

  @Get()
  async findAll(@Query('vendorId') vendorId?: number,
    @Query('categoryId') categoryId?: number,
    @Query('productId') productId?: number) {
    if (vendorId || categoryId || productId) {
      return this.marketingService.filter({ vendorId, categoryId, productId });
    }
    return this.marketingService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.marketingService.findOne(id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'media_files', maxCount: 10 }]))
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateMarketingContentDto,
    @UploadedFiles() files?: { media_files?: Express.Multer.File[] },
  ) {
    return this.marketingService.update(id, dto, files?.media_files);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    return this.marketingService.remove(id);
  }

  // Save/Unsave post
  @Post(':id/save')
  async toggleSave(
    @Param('id') id: number,
    @Body() body: { userId: number; userType?: string }
  ) {
    return this.marketingService.toggleSave(id, body.userId, body.userType || 'Customer');
  }

  // Add comment
  @Post(':id/comment')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string', example: 'Great post!' },
        userId: { type: 'number', example: 1 },
        userType: { type: 'string', example: 'Customer' },
      },
      required: ['text', 'userId'],
    },
  })
  async addComment(
    @Param('id') id: number,
    @Body() body: { text: string; userId: number; userType?: string }
  ) {
    return this.marketingService.addComment(id, body.text, body.userId, body.userType || 'Customer');
  }

  // Delete comment
  @Delete('comment/:commentId')
  async deleteComment(@Param('commentId') commentId: number) {
    return this.marketingService.deleteComment(commentId);
  }

// Share post + generate deep link
@Post(':id/share')
async sharePost(@Param('id') id: number) {
  const deepLink = await this.marketingService.incrementShare(id);
  return { deepLink };
}



  // Get saved posts for a user
  @Get('user/:userId/saved')
  async getSavedPosts(@Param('userId') userId: number) {
    return this.marketingService.getSavedPosts(userId);
  }

  // Get all comments by a particular customer
  @Get('user/:userId/comments')
  async getCommentsByCustomer(@Param('userId') userId: number) {
    return this.marketingService.getCommentsByCustomer(userId);
  }
}
