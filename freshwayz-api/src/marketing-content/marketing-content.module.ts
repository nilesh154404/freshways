import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketingContentService } from './marketing-content.service';
import { MarketingContentController } from './marketing-content.controller';
import { MarketingContent } from './entities/marketing-content.entity';
import { MarketingSave } from './entities/marketing-save.entity';
import { MarketingComment } from './entities/marketing-comment.entity';
import { MarketingReport } from './entities/marketing-report.entity';
import { CustomerVendorBlock } from './entities/customer-vendor-block.entity';
import { FileUploadModule } from 'src/file-upload/file-upload.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MarketingContent,
      MarketingSave,
      MarketingComment,
      MarketingReport,
      CustomerVendorBlock,
    ]),
    FileUploadModule,
    AuthModule,
  ],
  controllers: [MarketingContentController],
  providers: [MarketingContentService],
})
export class MarketingContentModule { }

