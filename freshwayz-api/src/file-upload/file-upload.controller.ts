// src/file-upload/file-upload.controller.ts
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from './file-upload.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { multerConfig } from './multer.config';
import { FileUpload } from './entities/file-upload.entity';
import { CreateFileUploadDto } from './dto/create-file-upload.dto';

@ApiTags('File Upload')
@Controller('files')
export class FileUploadController {
  constructor(private readonly fileService: FileUploadService) { }

  @Post('upload')
  @ApiOperation({ summary: 'Upload file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        customerId: { type: 'number', example: 1 },
        vendorId: { type: 'number', example: 2 },
        orderId: { type: 'number', example: 2 },
        tenantId: { type: 'number', example: 2 },
        marketingContentId: { type: 'number', },
      },
    },
  })
  @ApiResponse({ status: 201, type: FileUpload })
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadFileDto,
  ): Promise<FileUpload> {
    console.log(
     {
      d: body.customerId,
      b: body.vendorId,
      c: body.orderId, f: body.marketingContentId, t: body.tenantId
    });
    console.log('body:', body);
console.log('type of tenantId:', typeof body.tenantId);

    return this.fileService.saveFile(
      file,
      body.customerId,
      body.vendorId,
      body.orderId, body.marketingContentId,body.tenantId
    );
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get all file URLs by Customer ID' })
  @ApiParam({ name: 'customerId', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Array of file URLs',
    type: [String],
  })
  async getFilesByCustomer(
    @Param('customerId', ParseIntPipe) customerId: number,
  ): Promise<string[]> {
    return this.fileService.getFilesByCustomer(customerId);
  }

  @Get('vendor/:vendorId')
  @ApiOperation({ summary: 'Get all file URLs by Vendor ID' })
  @ApiParam({ name: 'vendorId', type: Number, example: 5 })
  @ApiResponse({
    status: 200,
    description: 'Array of file URLs',
    type: [String],
  })
  async getFilesByVendor(
    @Param('vendorId', ParseIntPipe) vendorId: number,
  ): Promise<string[]> {
    return this.fileService.getFilesByVendor(vendorId);
  }


  @Get('msfc/:tenantId')
  @ApiOperation({ summary: 'Get all file URLs by Vendor ID' })
  @ApiParam({ name: 'tenantId', type: Number, example: 5 })
  @ApiResponse({
    status: 200,
    description: 'Array of file URLs',
    type: [String],
  })
  async getFilesByTen(
    @Param('tenantId', ParseIntPipe) tenantId: number,
  ): Promise<string[]> {
    return this.fileService.getFilesByTen(tenantId);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get all file URLs by Vendor ID' })
  @ApiParam({ name: 'orderId', type: Number, example: 5 })
  @ApiResponse({
    status: 200,
    description: 'Array of file URLs',
    type: [String],
  })
  async getFilesByOrder(
    @Param('orderId', ParseIntPipe) orderId: number,
  ): Promise<string[]> {
    return this.fileService.getFilesByOrder(orderId);
  }

  // @Post()
  // create(@Body() createFileUploadDto: CreateFileUploadDto) {
  //   return this.fileService.create(createFileUploadDto);
  // }

  // @Get()
  // findAll() {
  //   return this.fileUploadService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.fileUploadService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateFileUploadDto: UpdateFileUploadDto) {
  //   return this.fileUploadService.update(+id, updateFileUploadDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.fileUploadService.remove(+id);
  // }
}
