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

  @ApiProperty({ example: 'Riya Sharma' })
  name: string;

  @ApiProperty({ example: 29 })
  age: number;

  @ApiProperty({ example: 'female' })
  gender: string;

  @ApiProperty({ example: 165 })
  heightCm: number;

  @ApiProperty({ example: 68 })
  weightKg: number;

  @ApiProperty({ example: 24.98 })
  bmi: number;

  @ApiProperty({ example: 'O+', nullable: true })
  bloodGroup: string | null;

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

  @ApiProperty({ example: 'CBC normal', nullable: true })
  bloodReports: string | null;

  @ApiProperty({ example: 18, nullable: true })
  vitaminD: number | null;

  @ApiProperty({ example: 230, nullable: true })
  vitaminB12: number | null;

  @ApiProperty({ example: 245, nullable: true })
  cholesterol: number | null;

  @ApiProperty({ example: 132, nullable: true })
  fastingSugar: number | null;

  @ApiProperty({ example: 6.7, nullable: true })
  hba1c: number | null;

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
}
