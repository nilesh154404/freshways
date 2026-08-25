import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketingContentService } from './marketing-content.service';
import { MarketingContentController } from './marketing-content.controller';
import { MarketingContent } from './entities/marketing-content.entity';
import { MarketingSave } from './entities/marketing-save.entity';
import { MarketingComment } from './entities/marketing-comment.entity';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MarketingContent, MarketingSave, MarketingComment]),
    FileUploadModule, // ✅ import so MarketingContentService can use FileUploadService
    AuthModule,
  ],
  controllers: [MarketingContentController],
  providers: [MarketingContentService],
})
export class MarketingContentModule {}
