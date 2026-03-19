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


import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiBody, ApiTags, ApiQuery, ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { AiService } from './ai.service';


// ✅ DTO OUTSIDE CONTROLLER (IMPORTANT)
class ChatDto {
  @ApiProperty({
    example: 'Suggest fruits',
    description: 'Message to send to AI',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}


@ApiTags('AI')
@Controller()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // 💬 CHAT API
  @Post('chat')
  @ApiBody({ type: ChatDto })
  async chat(@Body() body: ChatDto) {
    return this.aiService.sendChat(body.message);
  }

  // 🎯 RECOMMENDATIONS API
  @Get('recommendations')
  @ApiQuery({
    name: 'userId',
    required: true,
    example: '3',
  })
  async recommendations(@Query('userId') userId: string) {
    return this.aiService.getRecommendations(userId);
  }
}