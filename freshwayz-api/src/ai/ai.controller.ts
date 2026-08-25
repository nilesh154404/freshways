// import { Controller, Post, Body, Headers, Get, Query } from '@nestjs/common';
// import { ApiTags } from '@nestjs/swagger';
// import { AiService } from './ai.service';

// class ChatDto {
//   message: string;
// }

// @ApiTags('AI')
// @Controller()
// export class AiController {
//   constructor(private readonly aiService: AiService) {}

//   // POST /api/chat
//   @Post('chat')
//   async chat(@Headers('authorization') auth: string | undefined, @Body() body: ChatDto) {
//     const sessionKey = auth?.startsWith('Bearer ') ? auth.replace(/^Bearer\s+/, '') : auth;
//     const result = await this.aiService.sendChat(sessionKey, body?.message ?? '');
//     return result;
//   }

//   // GET /api/recommendations?userId=1
//   @Get('recommendations')
//   async recommendations(@Query('userId') userId: string) {
//     const res = await this.aiService.getRecommendations(userId);
//     return res;
//   }
// }


// import { Controller, Post, Body, Get, Query } from '@nestjs/common';
// import { ApiBody, ApiProperty, ApiTags } from '@nestjs/swagger';
// import { AiService } from './ai.service';

// @ApiTags('AI')
// @Controller()
// export class AiController {
//   constructor(private readonly aiService: AiService) {}

// export class ChatDto {
//   @ApiProperty({ description: 'Message to send to AI', type: String })
//   message: string;
// }

//   // 💬 CHAT API
//   @ApiBody({ type: ChatDto, description: 'Chat payload' })
//   @Post('chat')
//   async chat(@Body() body: ChatDto) {
//     if (!body?.message || body.message.trim() === '') {
//       return { response: 'Message is required' };
//     }

//     return await this.aiService.sendChat(body.message);
//   }

//   // 🎯 RECOMMENDATION API
//   @Get('recommendations')
//   async recommendations(@Query('userId') userId: string) {
//     return await this.aiService.getRecommendations(userId);
//   }
// }




// import { Controller, Post, Body, Get, Query } from '@nestjs/common';
// import { ApiBody, ApiTags, ApiQuery } from '@nestjs/swagger';
// import { AiService } from './ai.service';
// import { ChatDto } from './chat.dto';

// @ApiTags()
// @Controller() // 🔥 IMPORTANT (matches your Swagger routes)
// export class AiController {
//   constructor(private readonly aiService: AiService) {}

//   // 💬 CHAT API
//   @Post('chat')
//   @ApiBody({ type: ChatDto, description: 'Chat payload' })
//   async chat(@Body() body: ChatDto) {
//     if (!body?.message || body.message.trim() === '') {
//       return { response: 'Message is required' };
//     }

//     return await this.aiService.sendChat(body.message);
//   }

  

//   // 🎯 RECOMMENDATIONS API
//   @Get('recommendations')
//   @ApiQuery({
//     name: 'userId',
//     required: true,
//     example: '3',
//     description: 'User ID for recommendations',
//   })
//   async recommendations(@Query('userId') userId: string) {
//     return await this.aiService.getRecommendations(userId);
//   }
// }


import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AiService } from './ai.service';
import { ChatDto } from './chat.dto';
import { UpsertHealthProfileDto } from './dto/upsert-health-profile.dto';
import {
  HealthAnalysisResponseDto,
  HealthInsightsResponseDto,
  HealthProfileResponseDto,
} from './dto/health-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';


@ApiTags('AI')
@Controller()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  @ApiBody({ type: ChatDto })
  async chat(@Body() body: ChatDto) {
    return this.aiService.sendChat(body.message);
  }

  @Get('recommendations')
  @ApiQuery({
    name: 'userId',
    required: true,
    example: '3',
  })
  async recommendations(@Query('userId') userId: string) {
    return this.aiService.getRecommendations(userId);
  }

  @Post('health/profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Customer')
  @ApiBody({ type: UpsertHealthProfileDto })
  @ApiOkResponse({ type: HealthAnalysisResponseDto })
  async upsertHealthProfile(@Body() body: UpsertHealthProfileDto) {
    const result = await this.aiService.upsertHealthProfile(body);
    return {
      healthScore: result.healthScore,
      risks: result.risks,
      personalizedHealthReports: result.personalizedHealthReports,
      nutritionInsights: result.nutritionInsights,
      customDietGuidance: result.customDietGuidance,
      fitnessSuggestions: result.fitnessSuggestions,
      preventiveAlerts: result.preventiveAlerts,
      nutritionAlerts: result.nutritionAlerts,
    };
  }

  @Get('health/profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Customer')
  @ApiQuery({
    name: 'userId',
    required: true,
    example: 101,
  })
  @ApiOkResponse({ type: HealthProfileResponseDto })
  async getHealthProfile(@Query('userId', ParseIntPipe) userId: number) {
    return this.aiService.getHealthProfile(userId);
  }

  @Get('health/insights')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Customer')
  @ApiQuery({
    name: 'userId',
    required: true,
    example: 101,
  })
  @ApiOkResponse({ type: HealthInsightsResponseDto })
  async getHealthInsights(@Query('userId', ParseIntPipe) userId: number) {
    return this.aiService.getHealthInsights(userId);
  }

  @Post('health/reports')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['files', 'userId'],
      properties: {
        userId: { type: 'number', example: 101 },
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Reports processed and insights generated' })
  @UseInterceptors(FilesInterceptor('files', 10))
  async extractPdfReport(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('userId', ParseIntPipe) userId: number,
  ) {
    if (!files || files.length === 0) {
      throw new HttpException({ message: 'At least one file is required' }, HttpStatus.BAD_REQUEST);
    }
    return this.aiService.processReportsAndGenerateInsights(userId, files);
  }

  @Post('health/generate-insights')
  @ApiQuery({
    name: 'userId',
    required: true,
    example: 101,
  })
  @ApiOkResponse({ description: 'Insights generated and saved' })
  async generateInsights(@Query('userId', ParseIntPipe) userId: number) {
    return this.aiService.generateAndSaveInsights(userId);
  }

  @Get('health/insights/personalizedhealthreport')
  @ApiQuery({ name: 'userId', required: true, example: 101 })
  async getPersonalizedHealthReport(@Query('userId', ParseIntPipe) userId: number) {
    const insights = await this.aiService.getHealthInsights(userId);
    return insights?.personalizedHealthReports || {};
  }

  @Get('health/insights/nutritioninsights')
  @ApiQuery({ name: 'userId', required: true, example: 101 })
  async getNutritionInsights(@Query('userId', ParseIntPipe) userId: number) {
    const insights = await this.aiService.getHealthInsights(userId);
    return insights?.nutritionInsights || [];
  }

  @Get('health/insights/customerdietguidence')
  @ApiQuery({ name: 'userId', required: true, example: 101 })
  async getCustomerDietGuidance(@Query('userId', ParseIntPipe) userId: number) {
    const insights = await this.aiService.getHealthInsights(userId);
    return insights?.customDietGuidance || {};
  }

  @Get('health/insights/fitnesssuggestion')
  @ApiQuery({ name: 'userId', required: true, example: 101 })
  async getFitnessSuggestions(@Query('userId', ParseIntPipe) userId: number) {
    const insights = await this.aiService.getHealthInsights(userId);
    return insights?.fitnessSuggestions || [];
  }

  @Get('health/insights/preventivealerts')
  @ApiQuery({ name: 'userId', required: true, example: 101 })
  async getPreventiveAlerts(@Query('userId', ParseIntPipe) userId: number) {
    const insights = await this.aiService.getHealthInsights(userId);
    return insights?.preventiveAlerts || [];
  }

  @Get('health/insights/nutritionalerts')
  @ApiQuery({ name: 'userId', required: true, example: 101 })
  async getNutritionAlerts(@Query('userId', ParseIntPipe) userId: number) {
    const insights = await this.aiService.getHealthInsights(userId);
    return insights?.nutritionAlerts || [];
  }

  @Post('health/file-insights')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Health document file (PDF or text) to extract insights from',
        },
      },
    },
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        personalizedHealthReport: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            summary: { type: 'string' },
            keyPoints: { type: 'array', items: { type: 'string' } },
          },
        },
        nutritionInsights: { type: 'array', items: { type: 'string' } },
        customDietGuide: { type: 'array', items: { type: 'string' } },
        fitnessSuggestions: { type: 'array', items: { type: 'string' } },
        riskAlerts: { type: 'array', items: { type: 'string' } },
        preventiveAlerts: { type: 'array', items: { type: 'string' } },
        nutritionAlerts: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async getHealthInsightsFromFile(
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.aiService.getHealthInsightsFromFile(file);
  }
}