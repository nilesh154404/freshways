import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketingContentService } from './marketing-content.service';
import { MarketingContentController } from './marketing-content.controller';
import { MarketingContent } from './entities/marketing-content.entity';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
import { MarketingLike, MarketingSave, MarketingShare, MarketingComment } from './interactions/interactions.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MarketingContent,
      MarketingLike,
      MarketingSave,
      MarketingShare,
      MarketingComment
    ]),
    FileUploadModule,
  ],
  controllers: [MarketingContentController],
  providers: [MarketingContentService],
})
export class MarketingContentModule { }
