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
  insights: string[];
}

export function analyzeHealthProfile(profile: HealthAnalysisInput): HealthAnalysisResult {
  const risks: HealthRisk[] = [];
  const insights = new Set<string>();
  let healthScore = 100;

  const bmi = isValidNumber(profile.bmi)
    ? Number(profile.bmi)
    : calculateBmi(profile.heightCm, profile.weightKg);

  if (bmi >= 30) {
    risks.push({
      type: 'obesity',
      level: 'high',
      reason: `BMI of ${formatNumber(bmi)} indicates obesity`,
    });
    healthScore -= 10;
    insights.add('Aim for gradual weight loss through portion control, more daily movement, and fewer ultra-processed foods.');
  } else if (bmi >= 25) {
    risks.push({
      type: 'overweight',
      level: 'moderate',
      reason: `BMI of ${formatNumber(bmi)} indicates overweight range`,
    });
    healthScore -= 10;
    insights.add('Improve diet quality, increase daily activity, and track weight trend over time.');
  }

  const diabetesRisk = getDiabetesRisk(profile.hba1c, profile.fastingSugar);
  if (diabetesRisk) {
    risks.push(diabetesRisk.risk);
    healthScore -= 15;
    insights.add('Reduce added sugar and refined carbohydrates, and follow up with repeat glucose or HbA1c testing.');
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
      insights.add('Limit fried and processed foods, increase soluble fiber, and repeat a lipid profile with your clinician.');
    } else if (cholesterol >= 200) {
      risks.push({
        type: 'cholesterol',
        level: 'moderate',
        reason: `Total cholesterol of ${formatNumber(cholesterol)} mg/dL is borderline high`,
      });
      insights.add('Focus on heart-healthy meals, regular exercise, and monitoring cholesterol trends.');
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
      insights.add('Get safe sunlight exposure, include vitamin D-rich foods, and discuss supplementation with a doctor.');
    } else if (vitaminD < 30) {
      risks.push({
        type: 'vitamin_d_insufficiency',
        level: 'moderate',
        reason: `Vitamin D of ${formatNumber(vitaminD)} ng/mL indicates insufficiency`,
      });
      healthScore -= 5;
      insights.add('Increase vitamin D intake through food, sunlight, or supplementation as advised by a clinician.');
    }
  }

  if (isValidNumber(profile.sleepHours) && Number(profile.sleepHours) < 7) {
    risks.push({
      type: 'sleep',
      level: 'moderate',
      reason: `Sleep duration of ${formatNumber(profile.sleepHours)} hours is below the recommended 7 hours`,
    });
    healthScore -= 5;
    insights.add('Try to reach 7 to 9 hours of sleep with a consistent bedtime and wake-up schedule.');
  }

  const finalInsights = Array.from(insights);
  finalInsights.unshift('These are the insights from the manually added fields.');

  return {
    healthScore: clampScore(healthScore),
    risks,
    insights: finalInsights,
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