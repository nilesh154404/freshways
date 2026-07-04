import { ApiProperty } from '@nestjs/swagger';

export class HealthRiskDto {
  @ApiProperty({
    example: 'diabetes_risk',
    description: 'Risk category identified by the health intelligence engine',
  })
  type: string;

  @ApiProperty({
    example: 'high',
    enum: ['low', 'moderate', 'high'],
  })
  level: 'low' | 'moderate' | 'high';

  @ApiProperty({
    example: 'Elevated fasting sugar or HbA1c indicates diabetes risk',
  })
  reason: string;
}

export class HealthProfileResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 101 })
  userId: number;


  @ApiProperty({ example: 165 })
  heightCm: number;

  @ApiProperty({ example: 165, nullable: true })
  height: number | null;

  @ApiProperty({ example: 'cm' })
  heightUnit: string;

  @ApiProperty({ example: 68 })
  weightKg: number;

  @ApiProperty({ example: 24.9, nullable: true })
  bmi: number | null;

  @ApiProperty({ example: 'Maintain weight', nullable: true })
  goal: string | null;

  @ApiProperty({ example: 'Maintained', nullable: true })
  bmiStatus: string | null;

  @ApiProperty({ example: 'O+', nullable: true })
  bloodGroup: string | null;

  @ApiProperty({ example: 'Generate health score...', nullable: true })
  analysisPrompt: string | null;

  @ApiProperty({ example: 'Type 2 diabetes, controlled blood pressure', nullable: true })
  medicalInformation: string | null;

  @ApiProperty({
    example: 'Family history of diabetes',
    nullable: true,
  })
  medicalHistory: string | null;

  @ApiProperty({ example: 'Peanut allergy', nullable: true })
  allergies: string | null;

  @ApiProperty({ example: 'Metformin 500mg daily', nullable: true })
  currentMedications: string | null;

  @ApiProperty({ example: 6.5, nullable: true })
  sleepHours: number | null;

  @ApiProperty({ example: 'low', nullable: true })
  activityLevel: string | null;

  @ApiProperty({ example: 'low fiber vegetarian', nullable: true })
  dietPreference: string | null;

  @ApiProperty({ example: '2026-04-21T10:34:12.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-04-21T10:34:12.000Z' })
  updatedAt: Date;
}

export class HealthInsightsResponseDto {
  @ApiProperty({ type: HealthProfileResponseDto })
  profile: HealthProfileResponseDto;

  @ApiProperty({
    example: 74,
    minimum: 0,
    maximum: 100,
    description: 'Overall health score out of 100',
  })
  healthScore: number;

  @ApiProperty({ type: [HealthRiskDto] })
  risks: HealthRiskDto[];

  @ApiProperty({
    example: {
      status: 'Attention Required',
      summary: 'Your health score is 74. Some areas need attention.',
      keyPoints: ['Low vitamin D level detected'],
    },
  })
  personalizedHealthReports: any;

  @ApiProperty({ type: [String], example: ['Include more leafy greens.'] })
  nutritionInsights: string[];

  @ApiProperty({
    example: {
      breakfast: ['Oats with flaxseeds', 'Moong dal chilla'],
      lunch: ['Large salad with grilled tofu', 'Lentil soup with veggies'],
      dinner: ['Vegetable soup', 'Grilled paneer with sautéed greens'],
      snacks: ['A handful of walnuts', 'Roasted makhana'],
      foodsToAvoid: ['Refined sugar', 'Deep-fried snacks'],
    },
  })
  customDietGuidance: any;

  @ApiProperty({ type: [String], example: ['Daily 30 min walk.'] })
  fitnessSuggestions: string[];

  @ApiProperty({ type: [String], example: ['Monitor blood pressure regularly.'] })
  preventiveAlerts: string[];

  @ApiProperty({ type: [String], example: ['Avoid excessive sodium intake.'] })
  nutritionAlerts: string[];
}

export class HealthAnalysisResponseDto {
  @ApiProperty({
    example: 68,
    minimum: 0,
    maximum: 100,
    description: 'Overall health score out of 100',
  })
  healthScore: number;

  @ApiProperty({ type: [HealthRiskDto] })
  risks: HealthRiskDto[];

  @ApiProperty({
    example: {
      status: 'Attention Required',
      summary: 'Your health score is 68. Some areas need attention.',
      keyPoints: ['Obesity indicated'],
    },
  })
  personalizedHealthReports: any;

  @ApiProperty({ type: [String], example: ['Focus on high fiber foods.'] })
  nutritionInsights: string[];

  @ApiProperty({
    example: {
      breakfast: ['Multigrain toast with egg whites', 'Poha with veggies'],
      lunch: ['Balanced plate with 50% vegetables', 'Quinoa bowl'],
      dinner: ['Light meal like dal-palak', 'Sprout salad'],
      snacks: ['Fresh seasonal fruits', 'Soaked almonds'],
      foodsToAvoid: ['Processed snacks', 'Excess oil'],
    },
  })
  customDietGuidance: any;

  @ApiProperty({ type: [String], example: ['Incorporate light cardio.'] })
  fitnessSuggestions: string[];

  @ApiProperty({ type: [String], example: ['Annual health checkup advised.'] })
  preventiveAlerts: string[];

  @ApiProperty({ type: [String], example: ['Watch your sugar intake.'] })
  nutritionAlerts: string[];
}
