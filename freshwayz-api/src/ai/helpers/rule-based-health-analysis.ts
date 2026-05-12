export type HealthRiskLevel = 'low' | 'moderate' | 'high';

export interface HealthRisk {
  type: string;
  level: HealthRiskLevel;
  reason: string;
}

export interface HealthAnalysisInput {
  bmi?: number | null;
  heightCm?: number | null;
  weightKg?: number | null;
  fastingSugar?: number | null;
  hba1c?: number | null;
  cholesterol?: number | null;
  vitaminD?: number | null;
  sleepHours?: number | null;
}

export interface HealthAnalysisResult {
  healthScore: number;
  risks: HealthRisk[];
  personalizedHealthReports: {
    status: string;
    summary: string;
    keyPoints: string[];
  };
  nutritionInsights: string[];
  customDietGuidance: {
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks: string;
    foodsToAvoid: string[];
  };
  fitnessSuggestions: string[];
}

export function analyzeHealthProfile(profile: HealthAnalysisInput): HealthAnalysisResult {
  const risks: HealthRisk[] = [];
  let healthScore = 100;

  const bmi = isValidNumber(profile.bmi)
    ? Number(profile.bmi)
    : calculateBmi(profile.heightCm, profile.weightKg);

  const nutritionInsights: string[] = [];
  const customDietGuidance: string[] = [];
  const fitnessSuggestions: string[] = [];

  if (bmi >= 30) {
    risks.push({
      type: 'obesity',
      level: 'high',
      reason: `BMI of ${formatNumber(bmi)} indicates obesity`,
    });
    healthScore -= 10;
    nutritionInsights.push('Focus on a calorie-deficit diet with high fiber.');
    customDietGuidance.push('Reduce portion sizes and limit late-night snacking.');
    fitnessSuggestions.push('Start with 30 mins of brisk walking daily.');
  } else if (bmi >= 25) {
    risks.push({
      type: 'overweight',
      level: 'moderate',
      reason: `BMI of ${formatNumber(bmi)} indicates overweight range`,
    });
    healthScore -= 10;
    nutritionInsights.push('Maintain a balanced intake of proteins and vegetables.');
    customDietGuidance.push('Minimize sugary drinks and processed snacks.');
    fitnessSuggestions.push('Incorporate light cardio 3-4 times a week.');
  }

  const diabetesRisk = getDiabetesRisk(profile.hba1c, profile.fastingSugar);
  if (diabetesRisk) {
    risks.push(diabetesRisk.risk);
    healthScore -= 15;
    nutritionInsights.push('Prefer complex carbs over simple sugars.');
    customDietGuidance.push('Follow a low-glycemic index meal plan.');
    fitnessSuggestions.push('Consistent physical activity helps manage blood sugar.');
  }

  if (isValidNumber(profile.cholesterol)) {
    const cholesterol = Number(profile.cholesterol);
    if (cholesterol >= 240) {
      risks.push({
        type: 'cholesterol',
        level: 'high',
        reason: `Total cholesterol of ${formatNumber(cholesterol)} mg/dL is high`,
      });
      healthScore -= 10;
      nutritionInsights.push('Limit saturated and trans fats.');
      customDietGuidance.push('Increase intake of oats, beans, and healthy nuts.');
    } else if (cholesterol >= 200) {
      risks.push({
        type: 'cholesterol',
        level: 'moderate',
        reason: `Total cholesterol of ${formatNumber(cholesterol)} mg/dL is borderline high`,
      });
      nutritionInsights.push('Choose heart-healthy unsaturated fats.');
    }
  }

  if (isValidNumber(profile.vitaminD)) {
    const vitaminD = Number(profile.vitaminD);
    if (vitaminD < 20) {
      risks.push({
        type: 'vitamin_d_deficiency',
        level: 'high',
        reason: `Vitamin D of ${formatNumber(vitaminD)} ng/mL indicates deficiency`,
      });
      healthScore -= 5;
      nutritionInsights.push('Include vitamin D fortified foods.');
    }
  }

  if (isValidNumber(profile.sleepHours) && Number(profile.sleepHours) < 7) {
    risks.push({
      type: 'sleep',
      level: 'moderate',
      reason: `Sleep duration of ${formatNumber(profile.sleepHours)} hours is below the recommended 7 hours`,
    });
    healthScore -= 5;
  }
  
  const customDietGuidanceObj = {
    breakfast: 'Oats with nuts or sprouts.',
    lunch: 'Brown rice with plenty of vegetables and lean protein.',
    dinner: 'Light meal like soup or grilled vegetables.',
    snacks: 'Fresh seasonal fruits or roasted seeds.',
    foodsToAvoid: [] as string[],
  };

  if (bmi >= 30) {
    customDietGuidanceObj.breakfast = 'Oats with flaxseeds or a protein-rich moong dal chilla.';
    customDietGuidanceObj.lunch = 'Large portion of salad with a small portion of whole grains and lentils.';
    customDietGuidanceObj.dinner = 'Vegetable soup or sautéed greens with grilled tofu/chicken.';
    customDietGuidanceObj.foodsToAvoid.push('Refined carbs', 'Sugary beverages', 'Deep-fried items');
  } else if (bmi >= 25) {
    customDietGuidanceObj.breakfast = 'Multigrain toast with egg whites or poha with lots of veggies.';
    customDietGuidanceObj.lunch = 'Balanced plate with 50% vegetables, 25% protein, and 25% complex carbs.';
    customDietGuidanceObj.dinner = 'Light meal like dal-palak or a sprout salad.';
    customDietGuidanceObj.foodsToAvoid.push('Excess oil', 'Butter', 'Processed snacks');
  }

  if (diabetesRisk) {
    customDietGuidanceObj.lunch += ' Use low glycemic index foods like quinoa or buckwheat.';
    customDietGuidanceObj.foodsToAvoid.push('Fruit juices', 'Honey', 'High-sugar fruits (mango/grapes)');
  }

  if (isValidNumber(profile.cholesterol) && Number(profile.cholesterol) >= 200) {
    customDietGuidanceObj.snacks = '1-2 walnuts and soaked almonds daily.';
    customDietGuidanceObj.foodsToAvoid.push('Red meat', 'Full-fat dairy', 'Trans fats');
  }

  if (isValidNumber(profile.sleepHours) && Number(profile.sleepHours) < 7) {
    customDietGuidanceObj.dinner += ' Avoid caffeine 4-6 hours before bed.';
  }

  if (customDietGuidanceObj.foodsToAvoid.length === 0) {
    customDietGuidanceObj.foodsToAvoid.push('Deep-fried foods', 'Excess salt and sugar');
  }

  let status = 'Healthy';
  if (healthScore < 70) status = 'Critical';
  else if (healthScore < 85) status = 'Attention Required';

  return {
    healthScore: clampScore(healthScore),
    risks,
    personalizedHealthReports: {
      status,
      summary: `Your health score is ${clampScore(healthScore)}. ${risks.length > 0 ? 'Some areas need attention.' : 'You are doing well.'}`,
      keyPoints: risks.map(r => r.reason),
    },
    nutritionInsights: nutritionInsights.length > 0 ? nutritionInsights : ['Maintain a balanced and varied diet.'],
    customDietGuidance: customDietGuidanceObj,
    fitnessSuggestions: fitnessSuggestions.length > 0 ? fitnessSuggestions : ['Aim for at least 150 minutes of moderate activity per week.'],
  };
}

function getDiabetesRisk(hba1c?: number | null, fastingSugar?: number | null): { risk: HealthRisk } | null {
  const hasHighHba1c = isValidNumber(hba1c) && Number(hba1c) >= 6.5;
  const hasHighFasting = isValidNumber(fastingSugar) && Number(fastingSugar) >= 126;
  if (hasHighHba1c || hasHighFasting) {
    const reasons: string[] = [];
    if (hasHighHba1c) reasons.push(`HbA1c of ${formatNumber(hba1c)}% indicates diabetes`);
    if (hasHighFasting) reasons.push(`fasting sugar of ${formatNumber(fastingSugar)} mg/dL indicates diabetes`);

    return {
      risk: {
        type: 'diabetes',
        level: 'high',
        reason: reasons.join(' and '),
      },
    };
  }

  const hasPrediabetesHba1c = isValidNumber(hba1c) && Number(hba1c) >= 5.7 && Number(hba1c) <= 6.4;
  const hasPrediabetesFasting = isValidNumber(fastingSugar) && Number(fastingSugar) >= 100 && Number(fastingSugar) <= 125;
  if (hasPrediabetesHba1c || hasPrediabetesFasting) {
    const reasons: string[] = [];
    if (hasPrediabetesHba1c) reasons.push(`HbA1c of ${formatNumber(hba1c)}% suggests prediabetes`);
    if (hasPrediabetesFasting) reasons.push(`fasting sugar of ${formatNumber(fastingSugar)} mg/dL suggests prediabetes`);

    return {
      risk: {
        type: 'prediabetes',
        level: 'moderate',
        reason: reasons.join(' and '),
      },
    };
  }

  return null;
}

function calculateBmi(heightCm?: number | null, weightKg?: number | null): number {
  if (!isValidNumber(heightCm) || !isValidNumber(weightKg) || Number(heightCm) <= 0) {
    return 0;
  }

  const heightM = Number(heightCm) / 100;
  const bmi = Number(weightKg) / (heightM * heightM);
  return Number.isFinite(bmi) ? Number(bmi.toFixed(2)) : 0;
}

function clampScore(score: number): number {
  if (!Number.isFinite(score)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function formatNumber(value?: number | null): string {
  if (!isValidNumber(value)) {
    return '0';
  }

  return Number(value).toFixed(Number.isInteger(Number(value)) ? 0 : 1);
}

function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}