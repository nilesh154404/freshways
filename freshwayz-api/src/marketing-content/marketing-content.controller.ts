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
import { ApiTags, ApiConsumes, ApiBody, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { MarketingContentService } from './marketing-content.service';
import { CreateMarketingContentDto } from './dto/create-marketing-content.dto';
import { UpdateMarketingContentDto } from './dto/update-marketing-content.dto';
import { multerConfig } from './multer.config';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'Vendor')
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
    @Req() req: any,
    @UploadedFiles() files: { media_files?: Express.Multer.File[] }
  ) {
    const data = {
      ...dto,
      categoryId: Number(dto.categoryId),
      productId: dto.productId ? Number(dto.productId) : undefined,
      vendorId: dto.vendorId ? Number(dto.vendorId) : undefined,
    };

    return this.marketingService.create(data, files?.media_files, req.user);
  }

  @Get()
  async findAll(
    @Query('vendorId') vendorId?: number,
    @Query('categoryId') categoryId?: number,
    @Query('productId') productId?: number,
    @Query('customerId') customerId?: number,
  ) {
    if (vendorId || categoryId || productId) {
      return this.marketingService.filter({ vendorId, categoryId, productId, customerId: customerId ? Number(customerId) : undefined });
    }
    return this.marketingService.findAll(customerId ? Number(customerId) : undefined);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.marketingService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'Vendor')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'media_files', maxCount: 10 }],
      multerConfig
    )
  )
  async update(
    @Param('id') id: number,
    @Body() dto: any,
    @Req() req: any,
    @UploadedFiles() files?: { media_files?: Express.Multer.File[] },
  ) {
    const data = {
      ...dto,
      categoryId: dto.categoryId ? Number(dto.categoryId) : undefined,
      productId: dto.productId ? Number(dto.productId) : undefined,
      vendorId: dto.vendorId ? Number(dto.vendorId) : undefined,
    };
    return this.marketingService.update(id, data, files?.media_files, req.user);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'Vendor')
  async remove(@Param('id') id: number, @Req() req: any) {
    return this.marketingService.remove(id, req.user);
  }

  // Save/Unsave post — Customer only
  @Post(':id/save')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Customer')
  @ApiOperation({ summary: 'Save or unsave a marketing post (Customer only)' })
  @ApiResponse({ status: 403, description: 'Forbidden — Guest users cannot save posts' })
  async toggleSave(
    @Param('id') id: number,
    @Body() body: { userId: number; userType?: string }
  ) {
    return this.marketingService.toggleSave(id, body.userId, body.userType || 'Customer');
  }

  // Add comment — Customer only
  @Post(':id/comment')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Customer')
  @ApiOperation({ summary: 'Add a comment to a marketing post (Customer only)' })
  @ApiResponse({ status: 403, description: 'Forbidden — Guest users cannot comment' })
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

  // Delete comment — Customer only
  @Delete('comment/:commentId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Customer')
  @ApiOperation({ summary: 'Delete a comment (Customer only)' })
  async deleteComment(@Param('commentId') commentId: number) {
    return this.marketingService.deleteComment(commentId);
  }

// Share post + generate deep link
@Post(':id/share')
async sharePost(@Param('id') id: number) {
  return await this.marketingService.incrementShare(id);
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

  // ======================== REPORT ENDPOINTS ========================

  // Customer reports a post — POST /marketing/:id/report
  @Post(':id/report')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        customerId: { type: 'number', example: 5, description: 'ID of the customer reporting the post' },
        reason: { type: 'string', example: 'Inappropriate content', description: 'Reason for the report' },
      },
      required: ['customerId', 'reason'],
    },
  })
  async reportPost(
    @Param('id') id: number,
    @Body() body: { customerId: number; reason: string },
  ) {
    return this.marketingService.reportPost(Number(id), body.customerId, body.reason);
  }

  // Vendor: see all reports on their posts — GET /marketing/reports/vendor/:vendorId
  @Get('reports/vendor/:vendorId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'Vendor')
  async getReportsByVendor(@Param('vendorId') vendorId: number, @Req() req: any) {
    if (req.user?.role?.toLowerCase() === 'vendor' && req.user.profileId !== Number(vendorId)) {
      throw new ForbiddenException('You cannot access reports for another vendor');
    }
    return this.marketingService.getReportsByVendor(Number(vendorId));
  }

  // Admin: see all reports on all posts — GET /marketing/reports/all
  @Get('reports/all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  async getAllReports() {
    return this.marketingService.getAllReports();
  }

  // Vendor or Admin: see all reports on a specific post — GET /marketing/:id/reports
  @Get(':id/reports')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin', 'Vendor')
  async getReportsByPost(@Param('id') id: number, @Req() req: any) {
    return this.marketingService.getReportsByPost(Number(id), req.user);
  }

  // Admin: delete a reported post — DELETE /marketing/:id
  // (already exists as remove(), reused here for clarity)

  // ======================== BLOCK VENDOR ========================

  @Post('vendor/:vendorId/block')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        customerId: { type: 'number', example: 5 },
      },
      required: ['customerId'],
    },
  })
  async blockVendor(
    @Param('vendorId') vendorId: number,
    @Body() body: { customerId: number },
  ) {
    return this.marketingService.blockVendor(Number(vendorId), body.customerId);
  }
}
