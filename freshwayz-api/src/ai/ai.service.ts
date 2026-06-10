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


import { Injectable, Logger, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { PDFParse } from 'pdf-parse';
import { promises as fs } from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';
import { UpsertHealthProfileDto } from './dto/upsert-health-profile.dto';
import { analyzeHealthProfile } from './helpers/rule-based-health-analysis';
import { HealthProfile } from './entities/health-profile.entity';
import { Customer } from 'src/customer/entities/customer.entity';

export type ReportFindingStatus = 'normal' | 'abnormal' | 'unknown';

export interface ReportSummaryPatient {
  name: string;
  age: string;
  gender: string;
  reportDate: string;
  reference: string;
  sampleCollectionDate: string;
}

export interface ReportSummaryFinding {
  test: string;
  result: string;
  status: ReportFindingStatus;
  notes: string;
}

export interface ReportSummaryPayload {
  patient: ReportSummaryPatient;
  overview: string;
  keyFindings: ReportSummaryFinding[];
  normalValues: string[];
  abnormalValues: string[];
  recommendations: string[];
  disclaimer: string;
}

export interface StructuredReportSummary extends ReportSummaryPayload {
  markdown: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly baseUrl: string;
  private readonly healthAnalyzePath: string;
  private readonly geminiApiKey: string;
  private readonly geminiModel: string;
  private readonly username: string;
  private readonly password: string;
  private readonly fallbackMock: boolean;
  private readonly sharedFilesDir: string;
  private healthEndpointMissing = false;

  private sessionKey: string = '';

  constructor(
    private config: ConfigService,
    @InjectRepository(HealthProfile)
    private readonly healthProfileRepo: Repository<HealthProfile>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {
    this.baseUrl =
      this.config.get<string>('AI_BASE_URL') ||
      'https://ai.engine.freshwayz.dexpertsystems.com/api';
    this.healthAnalyzePath =
      this.config.get<string>('AI_HEALTH_ANALYZE_PATH') || '/health/analyze';
    this.geminiApiKey = this.config.get<string>('GEMINI_API_KEY') || '';
    this.geminiModel = this.config.get<string>('GEMINI_MODEL') || 'gemini-2.5-flash';

    this.username = this.config.get<string>('AI_USERNAME') || 'admin';
    this.password = this.config.get<string>('AI_PASSWORD') || 'secret';
    this.fallbackMock = !!this.config.get<boolean>('AI_FALLBACK_MOCK');
    this.sharedFilesDir =
      this.config.get<string>('SHARED_FILES_DIR') || path.resolve(process.cwd(), 'shared_files');
  }

  // Login to external AI engine.
  async login() {
    try {
      const res = await axios.post(`${this.baseUrl}/login`, {
        username: this.username,
        password: this.password,
      });

      this.sessionKey = res.data.sessionKey;
      this.logger.log('AI login successful');
    } catch (err: any) {
      this.logger.error('AI login failed', err?.message || err);
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
          message: message.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${this.sessionKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        },
      );

      return res.data;
    } catch (err: any) {
      this.logger.error(
        `AI chat failed -> ${url}`,
        err?.response?.data || err?.message || err,
      );

      if (err?.response?.status === 401) {
        this.logger.warn('AI session expired, re-authenticating');
        await this.login();
        return this.sendChat(message);
      }

      if (err?.response) {
        const aiBody = err.response.data;
        const aiStatus = err.response.status || 502;
        if (aiStatus >= 500 && this.fallbackMock) {
          this.logger.warn('AI returned server error, returning chat mock');
          return { reply: `Mock AI response for: ${message}` };
        }
        throw new HttpException({ aiStatus, aiBody }, HttpStatus.BAD_GATEWAY);
      }

      const code = err?.code;
      if (code === 'ECONNREFUSED' && this.fallbackMock) {
        this.logger.warn('AI unreachable, returning fallback mock response');
        return { reply: `AI unavailable, mock reply for message: ${message}` };
      }

      throw new HttpException(
        { message: err?.message || 'AI error' },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  // Recommendations from external AI engine.
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
      this.logger.error(
        `AI recommendations failed -> ${url}`,
        err?.response?.data || err?.message || err,
      );

      if (err?.response?.status === 401) {
        this.logger.warn('AI session expired, re-authenticating');
        await this.login();
        return this.getRecommendations(userId);
      }

      if (err?.response) {
        const aiStatus = err.response.status;
        const aiBody = err.response.data;
        // if server-side error and fallback enabled, return mocks
        if (aiStatus >= 500 && this.fallbackMock) {
          this.logger.warn('AI returned server error, returning recommendations mock');
          return [
            { id: 'mock-1', title: 'Milk', score: 0.9 },
            { id: 'mock-2', title: 'Bread', score: 0.8 },
          ];
        }
        throw new HttpException({ aiStatus, aiBody }, HttpStatus.BAD_GATEWAY);
      }

      const code = err?.code;
      if (code === 'ECONNREFUSED' && this.fallbackMock) {
        this.logger.warn('AI unreachable, returning recommendations mock');
        return [
          { id: 'mock-1', title: 'Milk', score: 0.9 },
          { id: 'mock-2', title: 'Bread', score: 0.8 },
        ];
      }

      throw new HttpException(
        { message: err?.message || 'AI recommendations error' },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
  

  async upsertHealthProfile(dto: UpsertHealthProfileDto) {
    const existing = await this.healthProfileRepo.findOne({
      where: { userId: dto.userId },
    });

    const payload: Partial<HealthProfile> = {};

    // Only copy properties from dto that are actually defined (not undefined)
    for (const key of Object.keys(dto)) {
      if (dto[key] !== undefined) {
        payload[key] = dto[key];
      }
    }

    // Calculate BMI if height and weight are provided (either in dto or already existing)
    const height = dto.heightCm !== undefined ? dto.heightCm : existing?.heightCm;
    const weight = dto.weightKg !== undefined ? dto.weightKg : existing?.weightKg;
    if (height !== undefined && weight !== undefined) {
      payload.bmi = this.calculateBmi(height, weight);
    }

    const entity = existing
      ? this.healthProfileRepo.merge(existing, payload)
      : this.healthProfileRepo.create(payload);

    const profile = await this.healthProfileRepo.save(entity);
    const insights = analyzeHealthProfile(profile);

    // Update entity with calculated baseline insights so they are persisted
    profile.personalizedHealthReports = insights.personalizedHealthReports;
    profile.nutritionInsights = insights.nutritionInsights;
    profile.customDietGuidance = insights.customDietGuidance;
    profile.fitnessSuggestions = insights.fitnessSuggestions;
    profile.preventiveAlerts = insights.preventiveAlerts;
    profile.nutritionAlerts = insights.nutritionAlerts;
    await this.healthProfileRepo.save(profile);

    // Sync to Customer table if the customer exists
    try {
      const customer = await this.customerRepo.findOne({ where: { id: dto.userId } });
      if (customer) {
        if (dto.name !== undefined) customer.fullName = dto.name;
        if (dto.gender !== undefined) customer.gender = dto.gender;
        if (dto.bloodGroup !== undefined) customer.bloodGroup = dto.bloodGroup;
        if (dto.heightCm !== undefined) customer.height = dto.heightCm;
        if (dto.weightKg !== undefined) customer.weight = dto.weightKg;
        if (dto.medicalHistory !== undefined) customer.medicalHistory = dto.medicalHistory;
        if (dto.dietPreference !== undefined) customer.dietPreference = dto.dietPreference;
        await this.customerRepo.save(customer);
      }
    } catch (err) {
      this.logger.error(`Failed to sync health profile to customer table for userId ${dto.userId}`, err?.message || err);
    }

    return {
      profile,
      ...insights,
    };
  }

  async getHealthProfile(userId: number) {
    const profile = await this.healthProfileRepo.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException(`Health profile not found for userId ${userId}`);
    }

    return profile;
  }

  async getHealthInsights(userId: number) {
    const profile = await this.getHealthProfile(userId);
    const insights = analyzeHealthProfile(profile);

    return {
      profile,
      ...insights,
    };
  }

  async extractPdfReportInsights(file: Express.Multer.File, prompt?: string) {
    if (!file) {
      throw new HttpException({ message: 'PDF file is required' }, HttpStatus.BAD_REQUEST);
    }

    const fileLooksLikePdf =
      file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');

    if (!fileLooksLikePdf) {
      throw new HttpException(
        { message: 'Only PDF files are supported' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new HttpException(
        { message: 'Uploaded PDF is empty or unreadable' },
        HttpStatus.BAD_REQUEST,
      );
    }

    let parsedPdfText = '';
    let parsedPdfPages = 0;
    const parser = new PDFParse({ data: file.buffer });
    try {
      const textResult = await parser.getText();
      parsedPdfText = String(textResult.text || '');
      parsedPdfPages = Number(textResult.total || textResult.pages?.length || 0);
    } catch (err: any) {
      this.logger.error('Failed to extract text from PDF', err?.message || err);
      throw new HttpException(
        { message: 'Failed to read PDF content' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    } finally {
      await parser.destroy().catch(() => undefined);
    }

    const extractedText = parsedPdfText.replace(/\s+/g, ' ').trim();

    if (!extractedText) {
      throw new HttpException(
        { message: 'No extractable text found in this PDF' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const reportSummary = await this.generateGeminiReportAnalysis(extractedText, prompt);

    return {
      fileName: file.originalname,
      pages: parsedPdfPages,
      extractedCharacters: extractedText.length,
      extractedTextPreview: this.createReadablePreview(extractedText),
      aiSummary: reportSummary.markdown,
      reportSummary,
    };
  }

  private calculateBmi(heightCm: number, weightKg: number): number {
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    return Number.isFinite(bmi) ? Number(bmi.toFixed(2)) : 0;
  }

  private async generateGeminiReportAnalysis(
    extractedText: string,
    prompt?: string,
  ): Promise<StructuredReportSummary> {
    if (!this.geminiApiKey) {
      throw new HttpException(
        { message: 'GEMINI_API_KEY is not configured on server' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const normalizedPrompt =
      prompt?.trim() || 'Summarize this report and list abnormal findings with practical recommendations.';

    const textForModel = extractedText.slice(0, 20000);
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;

    const res = await axios.post(
      url,
      {
        contents: [
          {
            parts: [
              {
                text: [
                  'You are a medical report assistant.',
                  'IMPORTANT: Ensure that the `disclaimer` field explicitly mentions: "these are the insights from the report".',
                  'Return STRICT JSON only. Do not wrap the response in markdown fences or add commentary.',
                  'Use this schema and keep values concise and user-friendly:',
                  JSON.stringify(
                    {
                      patient: {
                        name: '',
                        age: '',
                        gender: '',
                        reportDate: '',
                        reference: '',
                        sampleCollectionDate: '',
                      },
                      overview: '',
                      keyFindings: [
                        {
                          test: '',
                          result: '',
                          status: 'normal',
                          notes: '',
                        },
                      ],
                      normalValues: [''],
                      abnormalValues: [''],
                      recommendations: [''],
                      disclaimer: '',
                    },
                    null,
                    2,
                  ),
                  `User prompt: ${normalizedPrompt}`,
                  'Report text:',
                  textForModel,
                ].join('\n\n'),
              },
            ],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
        validateStatus: () => true,
      },
    );

    if (res.status < 200 || res.status >= 300) {
      this.logger.error('Gemini API call failed', {
        status: res.status,
        data: res.data,
      });
      throw new HttpException(
        {
          message: 'Gemini API request failed',
          geminiStatus: res.status,
          geminiBody: res.data,
        },
        HttpStatus.BAD_GATEWAY,
      );
    }

    const summaryText = this.extractGeminiText(res.data);
    if (!summaryText) {
      throw new HttpException(
        { message: 'Gemini response did not contain text output' },
        HttpStatus.BAD_GATEWAY,
      );
    }

    return this.normalizeReportSummary(summaryText);
  }

  private extractGeminiText(payload: any): string {
    if (!payload || typeof payload !== 'object') {
      return '';
    }

    const candidate = Array.isArray(payload.candidates) ? payload.candidates[0] : null;
    const parts = Array.isArray(candidate?.content?.parts) ? candidate.content.parts : [];
    const text = parts
      .map((part: any) => (typeof part?.text === 'string' ? part.text.trim() : ''))
      .filter(Boolean)
      .join('\n');

    return text;
  }

  private normalizeReportSummary(summaryText: string): StructuredReportSummary {
    const parsed = this.tryParseJson(summaryText);
    const payload = parsed
      ? this.normalizeReportSummaryPayload(parsed)
      : this.buildFallbackReportSummary(summaryText);

    return {
      ...payload,
      markdown: this.buildReportSummaryMarkdown(payload),
    };
  }

  private buildFallbackReportSummary(summaryText: string): ReportSummaryPayload {
    const cleanText = summaryText.trim();

    return {
      patient: {
        name: '',
        age: '',
        gender: '',
        reportDate: '',
        reference: '',
        sampleCollectionDate: '',
      },
      overview: cleanText,
      keyFindings: [],
      normalValues: [],
      abnormalValues: [],
      recommendations: [],
      disclaimer: 'These are the insights from the report. This summary was generated from extracted report text and should be reviewed by a clinician.',
    };
  }

  private normalizeReportSummaryPayload(rawPayload: any): ReportSummaryPayload {
    const patient = rawPayload?.patient ?? {};
    const keyFindings = Array.isArray(rawPayload?.keyFindings) ? rawPayload.keyFindings : [];

    return {
      patient: {
        name: this.cleanText(patient?.name),
        age: this.cleanText(patient?.age),
        gender: this.cleanText(patient?.gender),
        reportDate: this.cleanText(patient?.reportDate),
        reference: this.cleanText(patient?.reference),
        sampleCollectionDate: this.cleanText(patient?.sampleCollectionDate),
      },
      overview: this.cleanText(rawPayload?.overview),
      keyFindings: keyFindings.map((finding: any) => ({
        test: this.cleanText(finding?.test),
        result: this.cleanText(finding?.result),
        status: this.normalizeFindingStatus(finding?.status),
        notes: this.cleanText(finding?.notes),
      })),
      normalValues: this.toCleanStringArray(rawPayload?.normalValues),
      abnormalValues: this.toCleanStringArray(rawPayload?.abnormalValues),
      recommendations: this.toCleanStringArray(rawPayload?.recommendations),
      disclaimer: this.cleanText(rawPayload?.disclaimer),
    };
  }

  private buildReportSummaryMarkdown(payload: ReportSummaryPayload): string {
    const lines: string[] = ['## Report Summary'];

    const patientLines: string[] = [];
    if (payload.patient.name) patientLines.push(`- Name: ${payload.patient.name}`);
    if (payload.patient.age) patientLines.push(`- Age: ${payload.patient.age}`);
    if (payload.patient.gender) patientLines.push(`- Gender: ${payload.patient.gender}`);
    if (payload.patient.reportDate) patientLines.push(`- Report Date: ${payload.patient.reportDate}`);
    if (payload.patient.sampleCollectionDate) {
      patientLines.push(`- Sample Collection Date: ${payload.patient.sampleCollectionDate}`);
    }
    if (payload.patient.reference) patientLines.push(`- Reference: ${payload.patient.reference}`);

    if (patientLines.length > 0) {
      lines.push('', '### Patient');
      lines.push(...patientLines);
    }

    if (payload.overview) {
      lines.push('', '### Overview', payload.overview);
    }

    if (payload.keyFindings.length > 0) {
      lines.push('', '### Key Findings');
      payload.keyFindings.forEach((finding) => {
        const title = finding.test || 'Finding';
        const result = finding.result ? `: ${finding.result}` : '';
        const note = finding.notes ? ` (${finding.notes})` : '';
        lines.push(`- ${title}${result}${note}`);
      });
    }

    if (payload.abnormalValues.length > 0) {
      lines.push('', '### Abnormal Values');
      payload.abnormalValues.forEach((value) => lines.push(`- ${value}`));
    } else {
      lines.push('', '### Abnormal Values', '- None reported');
    }

    if (payload.normalValues.length > 0) {
      lines.push('', '### Normal Values');
      payload.normalValues.forEach((value) => lines.push(`- ${value}`));
    }

    if (payload.recommendations.length > 0) {
      lines.push('', '### Recommendations');
      payload.recommendations.forEach((value) => lines.push(`- ${value}`));
    }

    if (payload.disclaimer) {
      lines.push('', '### Note', payload.disclaimer);
    }

    return lines.join('\n');
  }

  private tryParseJson(summaryText: string): any | null {
    const cleaned = summaryText
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '');

    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');

    if (start === -1 || end === -1 || end <= start) {
      return null;
    }

    const jsonText = cleaned.slice(start, end + 1);

    try {
      return JSON.parse(jsonText);
    } catch {
      return null;
    }
  }

  private normalizeFindingStatus(status: any): ReportFindingStatus {
    const value = this.cleanText(status).toLowerCase();
    if (value === 'normal' || value === 'abnormal' || value === 'unknown') {
      return value;
    }

    return 'unknown';
  }

  private toCleanStringArray(value: any): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item) => this.cleanText(item)).filter(Boolean);
  }

  private cleanText(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    return String(value).trim();
  }

  private createReadablePreview(extractedText: string): string {
    const compactText = extractedText.replace(/\s+/g, ' ').trim();
    const previewLength = 1200;

    if (compactText.length <= previewLength) {
      return compactText;
    }

    return `${compactText.slice(0, previewLength).trimEnd()}...`;
  }

  private async getExternalHealthInsights(profile: HealthProfile, retried = false) {
    const url = this.buildHealthAnalyzeUrl();

    if (this.healthEndpointMissing) {
      return this.getHealthInsightsFromChat(profile);
    }

    if (!this.sessionKey) {
      await this.login();
    }

    const res = await axios.post(
      url,
      {
        userId: profile.userId,
        profile,
      },
      {
        headers: {
          Authorization: `Bearer ${this.sessionKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
        validateStatus: () => true,
      },
    );

    if (res.status >= 200 && res.status < 300) {
      const normalizedRisks = this.ensureRisks(
        Array.isArray(res.data?.risks) ? res.data.risks : [],
      );
      return {
        healthScore: Number(res.data?.healthScore ?? 0),
        risks: normalizedRisks,
        insights: Array.isArray(res.data?.insights) ? res.data.insights : [],
      };
    }

    if (res.status === 401 && !retried) {
      this.logger.warn('AI session expired for health analysis, re-authenticating');
      await this.login();
      return this.getExternalHealthInsights(profile, true);
    }

    if (res.status === 404) {
      if (!this.healthEndpointMissing) {
        this.logger.warn('Dedicated AI health endpoint not found, falling back to chat analysis');
        this.healthEndpointMissing = true;
      }
      return this.getHealthInsightsFromChat(profile);
    }

    if (this.fallbackMock) {
      this.logger.warn(`AI health analysis unavailable (${res.status}), returning fallback mock insights`);
      return {
        healthScore: 0,
        risks: [
          {
            type: 'analysis_unavailable',
            level: 'moderate',
            reason: 'External AI health analysis is currently unavailable',
          },
        ],
        insights: ['Health analysis service is temporarily unavailable. Please retry shortly.'],
      };
    }

    throw new HttpException(
      {
        message: res.data?.message || `AI health analysis error (${res.status})`,
        aiStatus: res.status,
        aiBody: res.data,
      },
      HttpStatus.BAD_GATEWAY,
    );
  }

  private async getHealthInsightsFromChat(profile: HealthProfile, retried = false) {
    const prompt = this.buildHealthAnalysisPrompt(profile);

    try {
      const aiResult = await this.sendChat(prompt);
      return this.normalizeHealthAnalysisResponse(aiResult, profile);
    } catch (err: any) {
      this.logger.error(
        'AI chat fallback for health analysis failed',
        err?.response?.data || err?.message || err,
      );

      if (err?.response?.status === 401 && !retried) {
        this.logger.warn('AI session expired during chat fallback, re-authenticating');
        await this.login();
        return this.getHealthInsightsFromChat(profile, true);
      }

      if (this.isAiProcessingFailure(err)) {
        this.logger.warn('AI processing failed for detailed health prompt, retrying with compact prompt');
        try {
          const compactPrompt = this.buildHealthAnalysisPrompt(profile, true);
          const compactResult = await this.sendChat(compactPrompt);
          return this.normalizeHealthAnalysisResponse(compactResult, profile);
        } catch {
          this.logger.warn('Compact health prompt also failed, returning safe profile-based fallback');
          return this.buildProfileBasedSafetyFallback(profile, '');
        }
      }

      if (this.fallbackMock) {
        return {
          healthScore: 0,
          risks: [
            {
              type: 'analysis_unavailable',
              level: 'moderate',
              reason: 'External AI chat fallback is currently unavailable',
            },
          ],
          insights: ['Health analysis service is temporarily unavailable. Please retry shortly.'],
        };
      }

      throw new HttpException(
        { message: err?.message || 'AI health analysis fallback error' },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  private buildHealthAnalysisPrompt(profile: HealthProfile, compact = false) {
    const bmi = profile.bmi ?? this.calculateBmi(profile.heightCm, profile.weightKg);
    const profileForPrompt = {
      userId: profile.userId,
      age: profile.age,
      gender: profile.gender,
      bmi,
      bloodGroup: profile.bloodGroup,
      medicalHistory: profile.medicalHistory,
      allergies: profile.allergies,
      currentMedications: profile.currentMedications,
      sleepHours: profile.sleepHours,
      activityLevel: profile.activityLevel,
      dietPreference: profile.dietPreference,
      vitaminD: profile.vitaminD,
      vitaminB12: profile.vitaminB12,
      cholesterol: profile.cholesterol,
      fastingSugar: profile.fastingSugar,
      hba1c: profile.hba1c,
    };

    if (compact) {
      return [
        'Return ONLY valid JSON, no markdown, no explanation.',
        'Schema: {"healthScore": number, "risks": [{"type": string, "level": "low"|"moderate"|"high", "reason": string}], "insights": [string, ...]}',
        'Use this health profile:',
        JSON.stringify(profileForPrompt),
      ].join('\n');
    }

    return [
      'You are a health intelligence engine for Freshwayz.',
      'Analyze the user health profile below and return ONLY valid JSON with this exact schema:',
      '{"healthScore": number, "risks": [{"type": string, "level": "low"|"moderate"|"high", "reason": string}], "insights": [string, ...]}',
      'Rules:',
      '- healthScore must be between 0 and 100.',
      '- include risks for obesity, diabetes, vitamin deficiency, and cholesterol only when relevant.',
      '- keep insights concise and practical.',
      '- do not include markdown, code fences, or extra text.',
      '',
      `Profile: ${JSON.stringify(profileForPrompt)}`,
    ].join('\n');
  }

  // Load shared files for a profile (names stored in profile.reportFileNames)
  private async loadSharedFilesForProfile(profile: HealthProfile): Promise<string[]> {
    if (!profile?.reportFileNames) return [];

    const names = String(profile.reportFileNames)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (names.length === 0) return [];

    const results: string[] = [];

    for (const name of names) {
      try {
        const filePath = path.isAbsolute(name) ? name : path.join(this.sharedFilesDir, name);
        const stat = await fs.stat(filePath).catch(() => null);
        if (!stat) {
          this.logger.warn(`Shared file not found: ${filePath}`);
          continue;
        }

        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.pdf') {
          const buffer = await fs.readFile(filePath);
          const parser = new PDFParse({ data: buffer });
          try {
            const textResult = await parser.getText();
            const text = String(textResult.text || '').replace(/\s+/g, ' ').trim();
            if (text) results.push(`--- ${name} (PDF) ---\n${text}`);
          } finally {
            await parser.destroy().catch(() => undefined);
          }
        } else {
          const raw = await fs.readFile(filePath, 'utf8');
          const cleaned = String(raw || '').replace(/\s+/g, ' ').trim();
          if (cleaned) results.push(`--- ${name} ---\n${cleaned}`);
        }
      } catch (err: any) {
        this.logger.warn(`Failed to load shared file ${name}: ${err?.message || err}`);
      }
    }

    return results;
  }

  private async normalizeHealthAnalysisResponse(aiResult: any, profile: HealthProfile) {
    const rawText = this.extractChatText(aiResult);
    const parsed = this.tryParseJsonFromText(rawText);
    const candidate = this.extractHealthPayloadCandidate(parsed);

    if (candidate) {
      return {
        healthScore: this.clampScore(candidate.healthScore),
        risks: this.ensureRisks(
          Array.isArray(candidate.risks) ? candidate.risks : [],
        ),
        insights: Array.isArray(candidate.insights) ? candidate.insights : [],
      };
    }

    const repaired = await this.repairHealthJsonWithAi(rawText, profile);
    const repairedCandidate = this.extractHealthPayloadCandidate(repaired);
    if (repairedCandidate) {
      return {
        healthScore: this.clampScore(repairedCandidate.healthScore),
        risks: this.ensureRisks(
          Array.isArray(repairedCandidate.risks) ? repairedCandidate.risks : [],
        ),
        insights: Array.isArray(repairedCandidate.insights)
          ? repairedCandidate.insights
          : [],
      };
    }

    const recovered = this.recoverFromTruncatedHealthText(rawText);
    if (recovered) {
      return recovered;
    }

    const profileFallback = this.buildProfileBasedSafetyFallback(profile, rawText);
    if (profileFallback) {
      return profileFallback;
    }

    return {
      healthScore: 0,
      risks: this.ensureRisks([]),
      insights: rawText ? [rawText] : ['AI health analysis returned an unexpected format.'],
    };
  }

  private extractChatText(aiResult: any): string {
    if (typeof aiResult === 'string') {
      return aiResult;
    }

    if (aiResult && typeof aiResult === 'object') {
      if (typeof aiResult.reply === 'string') return aiResult.reply;
      if (typeof aiResult.response === 'string') return aiResult.response;
      if (typeof aiResult.result === 'string') return aiResult.result;
      if (typeof aiResult.message === 'string') return aiResult.message;
      if (typeof aiResult.text === 'string') return aiResult.text;
      if (typeof aiResult.content === 'string') return aiResult.content;
      if (typeof aiResult?.data?.reply === 'string') return aiResult.data.reply;
      if (typeof aiResult?.data?.response === 'string') return aiResult.data.response;
      if (typeof aiResult?.data?.message === 'string') return aiResult.data.message;
      if (Array.isArray(aiResult.choices) && aiResult.choices[0]?.message?.content) {
        return String(aiResult.choices[0].message.content);
      }
    }

    return JSON.stringify(aiResult || '');
  }

  private tryParseJsonFromText(text: string) {
    if (!text) {
      return null;
    }

    try {
      return JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) {
        return null;
      }

      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
  }

  private clampScore(value: any) {
    const numeric = Number(value ?? 0);
    if (!Number.isFinite(numeric)) {
      return 0;
    }

    return Math.max(0, Math.min(100, Math.round(numeric)));
  }

  private ensureRisks(risks: any[]) {
    if (risks.length === 0) {
      return [
        {
          type: 'maintenance',
          level: 'low',
          reason: 'All health parameters are within normal range.',
        },
      ];
    }

    return risks;
  }

  private extractHealthPayloadCandidate(payload: any) {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    if (this.isHealthPayload(payload)) {
      return payload;
    }

    const nestedCandidates = [
      payload.data,
      payload.result,
      payload.response,
      payload.reply,
      payload.output,
      payload.analysis,
    ];

    for (const nested of nestedCandidates) {
      if (nested && typeof nested === 'object' && this.isHealthPayload(nested)) {
        return nested;
      }
    }

    return null;
  }

  private isHealthPayload(payload: any) {
    if (!payload || typeof payload !== 'object') {
      return false;
    }

    const hasScore = typeof payload.healthScore === 'number' || !Number.isNaN(Number(payload.healthScore));
    const hasRisks = Array.isArray(payload.risks);
    const hasInsights = Array.isArray(payload.insights);

    return hasScore && hasRisks && hasInsights;
  }

  private async repairHealthJsonWithAi(rawText: string, profile: HealthProfile) {
    if (!rawText) {
      return null;
    }

    const bmi = profile.bmi ?? this.calculateBmi(profile.heightCm, profile.weightKg);
    const repairPrompt = [
      'Convert the following health analysis into strict JSON only.',
      'Return exactly this schema and nothing else:',
      '{"healthScore": number, "risks": [{"type": string, "level": "low"|"moderate"|"high", "reason": string}], "insights": [string, ...]}',
      'Constraints:',
      '- healthScore between 0 and 100',
      '- at least 1 insight',
      '- no markdown/code fences',
      '',
      `Profile context: ${JSON.stringify({ ...profile, bmi })}`,
      `Text to convert: ${rawText}`,
    ].join('\n');

    try {
      const repairedResult = await this.sendChat(repairPrompt);
      const repairedText = this.extractChatText(repairedResult);
      return this.tryParseJsonFromText(repairedText);
    } catch {
      return null;
    }
  }

  private recoverFromTruncatedHealthText(rawText: string) {
    if (!rawText) {
      return null;
    }

    const scoreMatch = rawText.match(/"healthScore"\s*:\s*(\d+(?:\.\d+)?)/i);
    const score = scoreMatch ? this.clampScore(Number(scoreMatch[1])) : null;

    const riskRegex = /"type"\s*:\s*"([^"]+)"[\s\S]*?"level"\s*:\s*"([^"]+)"[\s\S]*?"reason"\s*:\s*"([^"]+)/gi;
    const risks: Array<{ type: string; level: 'low' | 'moderate' | 'high'; reason: string }> = [];
    let riskMatch: RegExpExecArray | null = riskRegex.exec(rawText);
    while (riskMatch) {
      const level = String(riskMatch[2]).toLowerCase();
      if (level === 'low' || level === 'moderate' || level === 'high') {
        risks.push({
          type: String(riskMatch[1]).trim(),
          level,
          reason: String(riskMatch[3]).trim(),
        });
      }
      riskMatch = riskRegex.exec(rawText);
    }

    if (score === null && risks.length === 0) {
      return null;
    }

    const insights = this.buildInsightsFromRiskReasons(risks.map((r) => r.reason));

    return {
      healthScore: score ?? 0,
      risks,
      insights,
    };
  }

  private buildProfileBasedSafetyFallback(profile: HealthProfile, rawText: string) {
    const calculated = this.generateHealthReport(profile);
    const insights = calculated.insights;

    return {
      healthScore: this.clampScore(calculated.healthScore),
      risks: calculated.risks,
      insights,
    };
  }

  private generateHealthReport(profile: HealthProfile) {
    let score = 100;
    const risks: Array<{ type: string; level: 'low' | 'moderate' | 'high'; reason: string }> = [];
    const insights: string[] = [];

    const { heightCm, weightKg, fastingSugar, hba1c, cholesterol, vitaminD, vitaminB12, sleepHours, activityLevel, dietPreference } = profile;

    const heightM = (heightCm ?? 0) / 100;
    const bmi = heightM > 0 ? (weightKg ?? 0) / (heightM * heightM) : 0;

    const addInsight = (text: string) => {
      if (!insights.includes(text)) {
        insights.push(text);
      }
    };

    const addRisk = (risk: { type: string; level: 'low' | 'moderate' | 'high'; reason: string }) => {
      if (!risks.some((existingRisk) => existingRisk.type === risk.type)) {
        risks.push(risk);
      }
    };

    if (bmi >= 30) {
      score -= 20;
      addRisk({
        type: 'obesity',
        level: 'high',
        reason: `BMI ${bmi.toFixed(2)} indicates severe obesity.`,
      });
      addInsight('Focus on weight reduction through a structured diet and exercise plan.');
    } else if (bmi >= 25) {
      score -= 10;
      addRisk({
        type: 'overweight',
        level: 'moderate',
        reason: `BMI ${bmi.toFixed(2)} indicates overweight condition.`,
      });
      addInsight('Increase physical activity and maintain a balanced diet to manage weight.');
    }

    if ((fastingSugar ?? 0) >= 126 || (hba1c ?? 0) >= 6.5) {
      score -= 20;
      addRisk({
        type: 'diabetes',
        level: 'high',
        reason: `Fasting sugar (${fastingSugar ?? 0} mg/dL) and HbA1c (${(hba1c ?? 0).toFixed(1)}%) indicate uncontrolled diabetes.`,
      });
      addInsight('Reduce sugar intake, avoid refined carbohydrates, and consult a doctor for diabetes management.');
    } else if (((fastingSugar ?? 0) >= 100 && (fastingSugar ?? 0) <= 125) || ((hba1c ?? 0) >= 5.7 && (hba1c ?? 0) <= 6.4)) {
      score -= 10;
      addRisk({
        type: 'prediabetes',
        level: 'moderate',
        reason: `Fasting sugar (${fastingSugar ?? 0} mg/dL) and HbA1c (${(hba1c ?? 0).toFixed(1)}%) indicate prediabetes.`,
      });
      addInsight('Monitor blood sugar regularly and limit refined carbohydrates.');
    }

    if ((cholesterol ?? 0) >= 240) {
      score -= 15;
      addRisk({
        type: 'cholesterol',
        level: 'high',
        reason: `Cholesterol (${cholesterol ?? 0} mg/dL) is critically high.`,
      });
      addInsight('Adopt a low-fat, high-fiber diet to manage cholesterol.');
    } else if ((cholesterol ?? 0) >= 200) {
      score -= 10;
      addRisk({
        type: 'cholesterol',
        level: 'moderate',
        reason: `Cholesterol (${cholesterol ?? 0} mg/dL) is slightly elevated.`,
      });
      addInsight('Reduce saturated fats and include heart-healthy foods.');
    }

    if ((vitaminD ?? 999) < 20 || (vitaminB12 ?? 999) < 200) {
      score -= 10;
      addRisk({
        type: 'vitamin_deficiency',
        level: 'high',
        reason: `Vitamin D (${vitaminD ?? 0} ng/mL) or Vitamin B12 (${vitaminB12 ?? 0} pg/mL) is severely low.`,
      });
      addInsight('Consider supplements and consult a doctor for deficiency treatment.');
    } else if ((vitaminD ?? 999) < 30 || (vitaminB12 ?? 999) < 300) {
      score -= 5;
      addRisk({
        type: 'vitamin_deficiency',
        level: 'low',
        reason: `Vitamin D (${vitaminD ?? 0} ng/mL) or Vitamin B12 (${vitaminB12 ?? 0} pg/mL) is mildly low.`,
      });
      addInsight('Improve vitamin levels through diet and sunlight exposure.');
    }

    if ((sleepHours ?? 0) < 6 || String(activityLevel || '').toLowerCase() === 'low') {
      score -= 10;
      addRisk({
        type: 'lifestyle',
        level: 'high',
        reason: `Low sleep (${sleepHours ?? 0} hours) and low physical activity significantly increase health risks.`,
      });
      addInsight('Aim for 7 to 8 hours of sleep and increase daily physical activity.');
    } else if ((sleepHours ?? 0) < 7) {
      score -= 5;
      addInsight('Aim for consistent 7 to 8 hours of sleep for optimal health.');
    }

    const diet = String(dietPreference || '').toLowerCase();
    if (diet.includes('junk') || diet.includes('high sugar')) {
      score -= 10;
      addRisk({
        type: 'diet',
        level: 'high',
        reason: 'High sugar and high fat diet negatively impacts overall health.',
      });
      addInsight('Reduce junk food and sugar intake, and focus on balanced meals with vegetables and lean protein.');
    }

    if (
      bmi >= 30 &&
      ((fastingSugar ?? 0) >= 126 || (hba1c ?? 0) >= 6.5) &&
      (cholesterol ?? 0) >= 240
    ) {
      score -= 10;
      addRisk({
        type: 'cardiovascular',
        level: 'high',
        reason: 'Multiple conditions significantly increase heart disease risk.',
      });
      addInsight('Immediate medical consultation is strongly recommended due to multiple high-risk conditions.');
    }

    if (risks.length === 0) {
      risks.push({
        type: 'maintenance',
        level: 'low',
        reason: 'All parameters are normal',
      });
      addInsight('Maintain your current healthy lifestyle and continue routine checkups.');
    }

    score = Math.max(15, Math.min(score, 95));

    const finalInsights = this.buildCalculatedInsightsFromStructuredRisks(risks, profile, insights);

    return {
      bmi: parseFloat(bmi.toFixed(2)),
      healthScore: score,
      risks,
      insights: finalInsights,
    };
  }

  private buildCalculatedInsightsFromStructuredRisks(
    risks: Array<{ type: string; level: 'low' | 'moderate' | 'high'; reason: string }>,
    profile: HealthProfile,
    existingInsights: string[],
  ) {
    const insights = new Set<string>(existingInsights.filter(Boolean));

    for (const risk of risks) {
      switch (risk.type) {
        case 'obesity':
        case 'overweight':
          insights.add('Reduce calorie-dense foods and increase regular physical activity.');
          break;
        case 'diabetes':
        case 'prediabetes':
          insights.add('Reduce sugar intake, avoid refined carbohydrates, and monitor blood glucose regularly.');
          break;
        case 'cholesterol':
          insights.add('Reduce saturated fats and add more fiber-rich foods.');
          break;
        case 'vitamin_deficiency':
          insights.add('Improve vitamin levels through diet, sunlight exposure, or supplements.');
          break;
        case 'lifestyle':
          insights.add('Aim for 7 to 8 hours of sleep and stay physically active.');
          break;
        case 'diet':
          insights.add('Limit junk food and high sugar meals, and prefer balanced meals.');
          break;
        case 'cardiovascular':
          insights.add('Consult a doctor because combined risk factors may affect heart health.');
          break;
        case 'maintenance':
          insights.add('Continue your healthy routine and keep regular checkups.');
          break;
      }
    }

    if ((profile.sleepHours ?? 0) < 7) {
      insights.add('Try to keep a consistent sleep schedule for better recovery.');
    }

    if ((profile.activityLevel || '').toLowerCase() === 'low') {
      insights.add('Increase daily movement to improve metabolism and energy levels.');
    }

    if (
      risks.some((risk) => risk.type === 'obesity' || risk.type === 'overweight') &&
      risks.some((risk) => risk.type === 'diabetes' || risk.type === 'prediabetes') &&
      risks.some((risk) => risk.type === 'cholesterol')
    ) {
      insights.add('Immediate medical consultation is strongly recommended due to multiple high-risk conditions.');
    }

    if (insights.size === 0) {
      insights.add('All parameters are normal. Continue your current healthy lifestyle.');
    }

    return Array.from(insights).slice(0, 6);
  }

  private buildInsightsFromRiskReasons(riskReasons: string[]) {
    const insights = new Set<string>();
    for (const reason of riskReasons) {
      const label = reason.toLowerCase();
      if (label.includes('obesity') || label.includes('overweight')) insights.add('Reduce calorie-dense foods and stay active.');
      if (label.includes('diabetes') || label.includes('prediabetes')) insights.add('Reduce sugar intake and monitor blood glucose.');
      if (label.includes('cholesterol')) insights.add('Choose more fiber-rich and heart-friendly foods.');
      if (label.includes('vitamin')) insights.add('Support vitamin levels with diet, sunlight, or supplements.');
      if (label.includes('sleep')) insights.add('Get enough sleep and keep a consistent routine.');
      if (label.includes('activity')) insights.add('Increase physical activity throughout the week.');
    }
    return Array.from(insights);
  }

  private isAiProcessingFailure(err: any) {
    const directError = String(err?.response?.data?.error || '').toLowerCase();
    const nestedError = String(err?.response?.aiBody?.error || '').toLowerCase();
    const message = String(err?.message || '').toLowerCase();

    const responseBody = typeof err?.getResponse === 'function' ? err.getResponse() : null;
    const bodyError = String((responseBody as any)?.aiBody?.error || '').toLowerCase();

    return (
      directError.includes('processing failed') ||
      nestedError.includes('processing failed') ||
      bodyError.includes('processing failed') ||
      message.includes('processing failed')
    );
  }

  private buildHealthAnalyzeUrl() {
    const path = this.healthAnalyzePath.trim();
    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    const normalizedBase = this.baseUrl.replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
  }

  async getHealthInsightsFromFile(file: Express.Multer.File) {
    if (!file) {
      throw new HttpException({ message: 'File is required' }, HttpStatus.BAD_REQUEST);
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new HttpException(
        { message: 'Uploaded file is empty or unreadable' },
        HttpStatus.BAD_REQUEST,
      );
    }

    let extractedText = '';
    const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      const parser = new PDFParse({ data: file.buffer });
      try {
        const textResult = await parser.getText();
        extractedText = String(textResult.text || '');
      } catch (err: any) {
        this.logger.error('Failed to extract text from PDF', err?.message || err);
        throw new HttpException(
          { message: 'Failed to read PDF content' },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      } finally {
        await parser.destroy().catch(() => undefined);
      }
    } else {
      extractedText = file.buffer.toString('utf8');
    }

    const cleanText = extractedText.replace(/\s+/g, ' ').trim();

    if (!cleanText) {
      throw new HttpException(
        { message: 'No extractable text found in this file' },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const prompt = this.buildHealthInsightsPrompt({}, cleanText.slice(0, 20000));
    return this.generateGeminiHealthInsights(prompt);
  }

  private buildHealthInsightsPrompt(userData: any, reportText: string): string {
    return `
You are a healthcare AI assistant.

Your task is to generate structured health insights based on:
1. User profile data
2. Uploaded medical reports (if any)

----------------------------------------
⚠️ STRICT RULES (VERY IMPORTANT)
----------------------------------------

1. Return ONLY valid JSON
- No explanation
- No extra text
- No markdown
- No comments

2. Always follow the exact JSON structure given below

3. If reports belong to different person:
- Clearly mention mismatch
- Still extract medical findings
- Mark them as "not directly applicable"

4. Do NOT hallucinate values
- If data not present → use null

5. Keep insights simple, medically safe, and realistic

----------------------------------------
📥 INPUT DATA
----------------------------------------

User Profile:
${JSON.stringify(userData || {}, null, 2)}

Uploaded Reports Content:
${reportText || "No reports uploaded"}

----------------------------------------
📤 OUTPUT FORMAT (STRICT JSON)
----------------------------------------

{
  "personalizedHealthReport": {
    "status": "string (Healthy | Attention Required | Critical)",
    "summary": "string (max 2 sentences)",
    "keyPoints": [
      "string (short bullet point)"
    ]
  },

  "nutritionInsights": [
    "string (short bullet point)"
  ],

  "customDietGuide": {
    "breakfast": ["string (2-3 specific healthy options)"],
    "lunch": ["string (2-3 specific healthy options)"],
    "dinner": ["string (2-3 specific healthy options)"],
    "snacks": ["string (2-3 healthy snacks)"],
    "foodsToAvoid": ["string (simple item)"]
  },

  "fitnessSuggestions": [
    "string (short bullet point)"
  ],

  "riskAlerts": [
    "string (urgent warnings if any)"
  ],

  "preventiveAlerts": [
    "string (preventive measures or early warnings based on health profile and reports)"
  ],

  "nutritionAlerts": [
    "string (warnings about nutritional deficiencies or excesses)"
  ],

  "reportAnalysis": {
    "isMismatch": boolean,
    "details": "string",
    "extractedFindings": [
      "string"
    ]
  },
  "extractedVitaminD": 0.0,
  "extractedVitaminB12": 0.0,
  "extractedCholesterol": 0.0,
  "extractedFastingSugar": 0.0,
  "extractedHba1c": 0.0,
  "extractedBloodReportsSummary": "string"
}

----------------------------------------
🧠 LOGIC TO FOLLOW
----------------------------------------

Step 1: Analyze user profile
- BMI, sleep, activity, medications, allergies

Step 2: Analyze reports
- Extract key findings (even if mismatch)
- Examples:
  - "HIV: Non-reactive"
  - "HBsAg: Non-reactive"
  - "Early uterine adenomyosis detected"
- IMPORTANT: Extract the exact numeric values for Vitamin D, Vitamin B12, Total Cholesterol, Fasting Sugar, and HbA1c from the report if present. If any value is missing from the report, set its corresponding extracted field to null.

Step 3: Detect mismatch
If:
- Name mismatch OR
- Age difference > 5 years
→ isMismatch = true

Step 4: Generate insights
- Personalized but safe
- No over-medical claims
- KEEP IT SHORT AND SIMPLE for mobile app users.

Step 5: Nutrition + Diet + Fitness suggestions
- Nutrition Insights: General food category advice.
- Diet Guide: Specific meal suggestions for Breakfast, Lunch, Dinner, and Snacks.
- Fitness: Activity types and frequency based on profile.
- Nutrition Alerts: Specific warnings regarding nutrient deficiencies, excesses, or dietary risks.

Step 6: Risk alerts
- Highlight possible risks (e.g. diabetes, low sleep)
- Preventive Alerts: Early warnings and preventive measures based on health risks.

----------------------------------------
🚫 DO NOT DO
----------------------------------------

- Do not return plain text
- Do not include explanation outside JSON
- Do not skip report findings
- Do not assume missing lab values
- ⚠️ IMPORTANT: Diet Guide and Fitness MUST contain ONLY lifestyle and food recommendations. DO NOT put medical risks, warnings, or disease progression alerts here.
- Do not put medical jargon or complex risks in the Diet or Fitness sections. Keep them simple, meal-based, and actionable.
`;
  }

  async generateGeminiHealthInsights(prompt: string): Promise<any> {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`;
      
      const response = await axios.post(
        url,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) {
        throw new Error('No response text from Gemini API');
      }

      // Parse JSON response from Gemini
      let parsedResponse = this.tryParseJson(responseText) || this.tryParseJsonFromText(responseText);
      if (!parsedResponse) {
        const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedResponse = this.tryParseJson(cleaned) || this.tryParseJsonFromText(cleaned);
      }

      if (!parsedResponse) {
        this.logger.error(`Failed to parse Gemini response as JSON. Raw response: ${responseText}`);
        throw new Error('Failed to parse Gemini response as JSON');
      }

      return parsedResponse;
    } catch (error: any) {
      this.logger.error('Error generating Gemini health insights:', error?.message || error);
      throw error;
    }
  }

  async generateAndSaveInsights(userId: number) {
    const profile = await this.healthProfileRepo.findOne({ where: { userId } });
    if (!profile) {
      throw new HttpException({ message: 'Health profile not found' }, HttpStatus.NOT_FOUND);
    }

    const userData = {
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      bmi: profile.bmi,
      bloodGroup: profile.bloodGroup,
      medicalHistory: profile.medicalHistory,
      allergies: profile.allergies,
      currentMedications: profile.currentMedications,
      sleepHours: profile.sleepHours,
      activityLevel: profile.activityLevel,
      dietPreference: profile.dietPreference,
      vitaminD: profile.vitaminD,
      vitaminB12: profile.vitaminB12,
      cholesterol: profile.cholesterol,
      fastingSugar: profile.fastingSugar,
      hba1c: profile.hba1c,
    };

    const prompt = this.buildHealthInsightsPrompt(userData, profile.bloodReports || '');
    const insights = await this.generateGeminiHealthInsights(prompt);
    
    profile.personalizedHealthReports = insights.personalizedHealthReport || {};
    profile.nutritionInsights = insights.nutritionInsights || [];
    profile.customDietGuidance = insights.customDietGuide || {};
    profile.fitnessSuggestions = insights.fitnessSuggestions || [];
    profile.preventiveAlerts = insights.preventiveAlerts || [];
    profile.nutritionAlerts = insights.nutritionAlerts || [];

    if (insights.extractedBloodReportsSummary) profile.bloodReports = insights.extractedBloodReportsSummary;
    if (insights.extractedVitaminD) profile.vitaminD = Number(insights.extractedVitaminD);
    if (insights.extractedVitaminB12) profile.vitaminB12 = Number(insights.extractedVitaminB12);
    if (insights.extractedCholesterol) profile.cholesterol = Number(insights.extractedCholesterol);
    if (insights.extractedFastingSugar) profile.fastingSugar = Number(insights.extractedFastingSugar);
    if (insights.extractedHba1c) profile.hba1c = Number(insights.extractedHba1c);

    await this.healthProfileRepo.save(profile);

    return { message: 'Insights generated and saved successfully', insights };
  }

  async getHealthProfileEntity(userId: number) {
    return this.healthProfileRepo.findOne({ where: { userId } });
  }

  async processReportsAndGenerateInsights(userId: number, files: Express.Multer.File[]) {
    const profile = await this.healthProfileRepo.findOne({ where: { userId } });
    if (!profile) {
      throw new HttpException({ message: 'Health profile not found for this user' }, HttpStatus.NOT_FOUND);
    }

    let combinedText = '';
    for (const file of files) {
      const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf');
      if (isPdf) {
        const parser = new PDFParse({ data: file.buffer });
        try {
          const textResult = await parser.getText();
          combinedText += `\n--- File: ${file.originalname} ---\n${textResult.text}`;
        } catch (err) {
          this.logger.error(`Failed to parse PDF ${file.originalname}`, err);
        } finally {
          await parser.destroy().catch(() => undefined);
        }
      } else {
        combinedText += `\n--- File: ${file.originalname} ---\n${file.buffer.toString('utf8')}`;
      }
    }

    // Save the raw text in bloodReports so we have a record
    profile.bloodReports = (profile.bloodReports ? profile.bloodReports + '\n' : '') + combinedText;

    const userData = {
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      bmi: profile.bmi,
      bloodGroup: profile.bloodGroup,
      medicalHistory: profile.medicalHistory,
      allergies: profile.allergies,
      currentMedications: profile.currentMedications,
      sleepHours: profile.sleepHours,
      activityLevel: profile.activityLevel,
      dietPreference: profile.dietPreference,
      vitaminD: profile.vitaminD,
      vitaminB12: profile.vitaminB12,
      cholesterol: profile.cholesterol,
      fastingSugar: profile.fastingSugar,
      hba1c: profile.hba1c,
    };

    const prompt = this.buildHealthInsightsPrompt(userData, combinedText.slice(0, 20000));
    const insights = await this.generateGeminiHealthInsights(prompt);
    
    profile.personalizedHealthReports = insights.personalizedHealthReport || {};
    profile.nutritionInsights = insights.nutritionInsights || [];
    profile.customDietGuidance = insights.customDietGuide || {};
    profile.fitnessSuggestions = insights.fitnessSuggestions || [];
    profile.preventiveAlerts = insights.preventiveAlerts || [];
    profile.nutritionAlerts = insights.nutritionAlerts || [];
    
    if (insights.extractedBloodReportsSummary) profile.bloodReports = insights.extractedBloodReportsSummary;
    if (insights.extractedVitaminD) profile.vitaminD = Number(insights.extractedVitaminD);
    if (insights.extractedVitaminB12) profile.vitaminB12 = Number(insights.extractedVitaminB12);
    if (insights.extractedCholesterol) profile.cholesterol = Number(insights.extractedCholesterol);
    if (insights.extractedFastingSugar) profile.fastingSugar = Number(insights.extractedFastingSugar);
    if (insights.extractedHba1c) profile.hba1c = Number(insights.extractedHba1c);

    profile.reportFileCount = (profile.reportFileCount || 0) + files.length;
    profile.reportFileNames = [profile.reportFileNames, ...files.map(f => f.originalname)].filter(Boolean).join(', ');

    await this.healthProfileRepo.save(profile);

    return { message: 'Reports processed, values extracted, and insights generated successfully', insights };
  }
}