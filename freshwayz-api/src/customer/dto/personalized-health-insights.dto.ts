import { ApiProperty } from '@nestjs/swagger';

export class PersonalizedHealthInsightsDto {
    @ApiProperty()
    personalizedHealthReports: string[];

    @ApiProperty()
    nutritionInsights: string[];

    @ApiProperty()
    customDietGuidance: string[];

    @ApiProperty()
    fitnessSuggestions: string[];

    @ApiProperty()
    productRecommendations: string[];

    @ApiProperty()
    preventiveAlerts: string[];

    @ApiProperty({ type: Object })
    rawData?: {
        healthScore?: number;
        risks?: string[];
        insights?: string[];
        recommendations?: string[];
    };
}

export class RegistrationWithAIInsightsDto {
    @ApiProperty()
    message: string;

    @ApiProperty()
    localUser: any;

    @ApiProperty()
    healthProfile: any;

    @ApiProperty({ type: PersonalizedHealthInsightsDto })
    aiGeneratedInsights?: PersonalizedHealthInsightsDto;

    @ApiProperty()
    externalResponse?: any;
}
