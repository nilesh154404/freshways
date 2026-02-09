// src/file-upload/file-upload.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileUpload } from './entities/file-upload.entity';
import { UpdateFileUploadDto } from './dto/update-file-upload.dto';
import { MarketingContent } from 'src/marketing-content/entities/marketing-content.entity';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(FileUpload)
    private readonly fileRepo: Repository<FileUpload>,
    @InjectRepository(MarketingContent) // ✅ THIS WAS MISSING
    private readonly marketingRepo: Repository<MarketingContent>,) { }

  async saveFile(
    file: Express.Multer.File,
    customerId?: number,
    vendorId?: number,
    orderId?: number,
    marketingContentId?: number,
    tenantId?: number
  ): Promise<FileUpload> {

    let marketingContent: MarketingContent | null = null;

    if (marketingContentId) {
      marketingContent = await this.marketingRepo.findOne({
        where: { id: marketingContentId },
      });

      if (!marketingContent) {
        throw new NotFoundException('Marketing content not found');
      }
    }
    console.log(tenantId);

    const fileUpload = this.fileRepo.create({
      fileName: file.filename,
      fileUrl: `https://freshwayz.dexpertsystems.com/uploads/${file.filename}`,
      customerId,
      vendorId,
      orderId, tenantId,
      ...(marketingContent ? { marketingContent } : {}),
    });

    return await this.fileRepo.save(fileUpload);
  }


  async getFilesByCustomer(customerId: number): Promise<string[]> {
    const files = await this.fileRepo.find({
      where: { customerId },
    });

    return files.map(file => file.fileUrl); // return only URL
  }

  async getFilesByVendor(vendorId: number): Promise<string[]> {
    const files = await this.fileRepo.find({
      where: { vendorId },
    });

    return files.map(file => file.fileUrl); // return only URL
  }

  async getFilesByTen(tenantId: number): Promise<string[]> {
    const files = await this.fileRepo.find({
      where: { tenantId },
    });

    return files.map(file => file.fileUrl); // return only URL
  }
  async getFilesByOrder(orderId: number): Promise<string[]> {
    const files = await this.fileRepo.find({
      where: { orderId },
    });

    return files.map(file => file.fileUrl); // return only URL
  }

  findAll() {
    return `This action returns all fileUpload`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fileUpload`;
  }

  update(id: number, updateFileUploadDto: UpdateFileUploadDto) {
    return `This action updates a #${id} fileUpload`;
  }

  remove(id: number) {
    return `This action removes a #${id} fileUpload`;
  }

  // ✅ New method to save multiple files for marketing content
  async saveFilesForMarketing(files: Express.Multer.File[], marketingContentId: number) {
    const marketingContent = await this.marketingRepo.findOne({
      where: { id: marketingContentId },
    });

    if (!marketingContent) throw new NotFoundException('Marketing content not found');

    const fileEntities = files.map((file) =>
      this.fileRepo.create({
        fileName: file.filename,
        fileUrl: `http://localhost:3064/uploads/${file.filename}`,
        marketingContent,
      }),
    );

    return this.fileRepo.save(fileEntities);
  }

}
