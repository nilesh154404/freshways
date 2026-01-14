import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileUploadService } from './file-upload.service';
import { FileUploadController } from './file-upload.controller';
import { FileUpload } from './entities/file-upload.entity';
import { MarketingContent } from 'src/marketing-content/entities/marketing-content.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FileUpload, MarketingContent])],
  controllers: [FileUploadController],
  providers: [FileUploadService],
  exports: [FileUploadService], // ✅ export so other modules can use it
})
export class FileUploadModule {}
