// import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import axios from 'axios';

// @Injectable()
// export class AiService {
//   private readonly logger = new Logger(AiService.name);
//   private readonly baseUrl: string;

//   constructor(private config: ConfigService) {
//     this.baseUrl = this.config.get<string>('AI_BASE_URL') || 'http://127.0.0.1:8080/api';
//     this.fallbackMock = !!this.config.get<boolean>('AI_FALLBACK_MOCK');
//   }

//   // Proxy chat message to AI engine using axios
//   async sendChat(sessionKey: string | undefined, message: string) {
//     const url = `${this.baseUrl.replace(/\/$/, '')}/chat`;
//     try {
//       const headers: Record<string, string> = { 'Content-Type': 'application/json' };
//       if (sessionKey) headers['Authorization'] = `Bearer ${sessionKey}`;

//       const res = await axios.post(url, { message }, { headers, validateStatus: () => true, timeout: 15000 });

//       if (res.status < 200 || res.status >= 300) {
//         this.logger.warn(`AI chat proxy failed: ${res.status} ${JSON.stringify(res.data)}`);
//         throw new Error(res.data?.message || `AI chat error ${res.status}`);
//       }

//       return res.data;
//     } catch (err: any) {
//       this.logger.error(`Failed to call AI chat -> ${this.baseUrl}`, err?.toString?.() || err);
//       const code = err?.code || (err?.toString && /ECONNREFUSED/.test(String(err.toString())) ? 'ECONNREFUSED' : undefined);
//       if (code === 'ECONNREFUSED') {
//         if (this.fallbackMock) {
//           this.logger.warn('AI unreachable — returning fallback mock response');
//           return { reply: `AI unavailable — mock reply for message: ${message}` };
//         }
//         throw new HttpException({ message: `AI service unreachable at ${this.baseUrl}` }, HttpStatus.BAD_GATEWAY);
//       }
//       throw new HttpException({ message: err?.message || 'AI chat proxy error' }, HttpStatus.INTERNAL_SERVER_ERROR);
//     }
//   }

//   // Proxy recommendations request using axios
//   async getRecommendations(userId: string | number) {
//     const url = `${this.baseUrl.replace(/\/$/, '')}/recommendations`;
//     try {
//       const res = await axios.get(url, {
//         params: { userId: String(userId) },
//         headers: { 'Content-Type': 'application/json' },
//         validateStatus: () => true,
//         timeout: 15000,
//       });

//       if (res.status < 200 || res.status >= 300) {
//         this.logger.warn(`AI recommendations proxy failed: ${res.status} ${JSON.stringify(res.data)}`);
//         throw new Error(res.data?.message || `AI recommendations error ${res.status}`);
//       }

//       return res.data || [];
//     } catch (err: any) {
//       this.logger.error(`Failed to call AI recommendations -> ${this.baseUrl}`, err?.toString?.() || err);
//       const code = err?.code || (err?.toString && /ECONNREFUSED/.test(String(err.toString())) ? 'ECONNREFUSED' : undefined);
//       if (code === 'ECONNREFUSED') {
//         if (this.fallbackMock) {
//           this.logger.warn('AI unreachable — returning fallback mock recommendations');
//           return [
//             { id: 'mock-1', title: 'Mock Product A', score: 0.9 },
//             { id: 'mock-2', title: 'Mock Product B', score: 0.75 },
//           ];
//         }
//         throw new HttpException({ message: `AI service unreachable at ${this.baseUrl}` }, HttpStatus.BAD_GATEWAY);
//       }
//       throw new HttpException({ message: err?.message || 'AI recommendations proxy error' }, HttpStatus.INTERNAL_SERVER_ERROR);
//     }
//   }
// }


import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly baseUrl: string;
  private readonly username: string;
  private readonly password: string;
  private readonly fallbackMock: boolean;

  private sessionKey: string = '';

  constructor(private config: ConfigService) {
    this.baseUrl =
      this.config.get<string>('AI_BASE_URL') ||
      'https://ai.engine.freshwayz.dexpertsystems.com/api';

    this.username = this.config.get<string>('AI_USERNAME') || 'admin';
    this.password = this.config.get<string>('AI_PASSWORD') || 'secret';
    this.fallbackMock = !!this.config.get<boolean>('AI_FALLBACK_MOCK');
  }

  // 🔐 LOGIN TO AI ENGINE
  async login() {
    try {
      const res = await axios.post(`${this.baseUrl}/login`, {
        username: this.username,
        password: this.password,
      });

      this.sessionKey = res.data.sessionKey;
      this.logger.log('✅ AI login successful');
    } catch (err: any) {
      this.logger.error('❌ AI login failed', err?.message || err);
      throw new HttpException(
        { message: 'AI login failed' },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

//   // 💬 CHAT
//   async sendChat(message: string) {
//     const url = `${this.baseUrl}/chat`;

//     try {
//       // ensure login
//       if (!this.sessionKey) {
//         await this.login();
//       }

//       const res = await axios.post(
//         url,
//         { message },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${this.sessionKey}`,
//           },
//           timeout: 15000,
//         },
//       );

//       return res.data;
//     } catch (err: any) {
//       this.logger.error(`❌ AI chat failed -> ${this.baseUrl}`, err?.message || err);

//       // retry once if session expired
//       if (err?.response?.status === 401) {
//         this.logger.warn('🔁 Session expired, re-login...');
//         await this.login();

//         return this.sendChat(message);
//       }

//       if (this.fallbackMock) {
//         return {
//           reply: `Mock AI response for: ${message}`,
//         };
//       }

//       throw new HttpException(
//         { message: err?.message || 'AI chat error' },
//         HttpStatus.BAD_GATEWAY,
//       );
//     }
//   }

async sendChat(message: string) {
  const url = `${this.baseUrl}/chat`;

  try {
    if (!this.sessionKey) {
      await this.login();
    }

    const res = await axios.post(
      url,
      {
        message: message.trim(), // 🔥 IMPORTANT
      },
      {
        headers: {
          Authorization: `Bearer ${this.sessionKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    return res.data;

  } catch (err: any) {
    this.logger.error(`❌ AI chat failed -> ${url}`, err?.response?.data || err?.message || err);

    if (err?.response) {
      // propagate AI response body for easier debugging
      const aiBody = err.response.data;
      const aiStatus = err.response.status || 502;
      // If server error and fallback enabled, return mock
      if (aiStatus >= 500 && this.fallbackMock) {
        this.logger.warn('AI returned server error — returning chat mock');
        return { reply: `Mock AI response for: ${message}` };
      }
      throw new HttpException({ aiStatus, aiBody }, HttpStatus.BAD_GATEWAY);
    }

    const code = err?.code;
    if (code === 'ECONNREFUSED' && this.fallbackMock) {
      this.logger.warn('AI unreachable — returning fallback mock response');
      return { reply: `AI unavailable — mock reply for message: ${message}` };
    }

    throw new HttpException({ message: err?.message || 'AI error' }, HttpStatus.BAD_GATEWAY);
  }
}

  // 🎯 RECOMMENDATIONS
  async getRecommendations(userId: string | number) {
    const url = `${this.baseUrl}/recommendations`;

    try {
      // ensure logged in to include Authorization header
      if (!this.sessionKey) {
        await this.login();
      }
      const res = await axios.get(url, {
        params: { userId: String(userId) },
        headers: {
          Authorization: `Bearer ${this.sessionKey}`,
        },
        timeout: 15000,
      });

      return res.data;
    } catch (err: any) {
      this.logger.error(`❌ AI recommendations failed -> ${url}`, err?.response?.data || err?.message || err);

      if (err?.response) {
        const aiStatus = err.response.status;
        const aiBody = err.response.data;
        // if server-side error and fallback enabled, return mocks
        if (aiStatus >= 500 && this.fallbackMock) {
          this.logger.warn('AI returned server error — returning recommendations mock');
          return [
            { id: 'mock-1', title: 'Milk', score: 0.9 },
            { id: 'mock-2', title: 'Bread', score: 0.8 },
          ];
        }
        throw new HttpException({ aiStatus, aiBody }, HttpStatus.BAD_GATEWAY);
      }

      const code = err?.code;
      if (code === 'ECONNREFUSED' && this.fallbackMock) {
        this.logger.warn('AI unreachable — returning recommendations mock');
        return [
          { id: 'mock-1', title: 'Milk', score: 0.9 },
          { id: 'mock-2', title: 'Bread', score: 0.8 },
        ];
      }

      throw new HttpException({ message: err?.message || 'AI recommendations error' }, HttpStatus.BAD_GATEWAY);
    }
  }
}