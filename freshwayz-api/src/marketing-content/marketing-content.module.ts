import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketingContentService } from './marketing-content.service';
import { MarketingContentController } from './marketing-content.controller';
import { MarketingContent } from './entities/marketing-content.entity';
import { FileUploadModule } from 'src/file-upload/file-upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarketingContent]),
    FileUploadModule, // ✅ import so MarketingContentService can use FileUploadService
  ],
  controllers: [MarketingContentController],
  providers: [MarketingContentService],
})
export class MarketingContentModule {}
