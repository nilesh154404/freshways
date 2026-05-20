import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class HealthProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  userId: number;

  @Column()
  name: string;

  @Column({ type: 'int' })
  age: number;

  @Column()
  gender: string;

  @Column({ type: 'float' })
  heightCm: number;

  @Column({ type: 'float' })
  weightKg: number;

  @Column({ type: 'float', nullable: true })
  bmi: number;

  @Column({ nullable: true })
  bloodGroup: string;

  @Column({ type: 'text', nullable: true })
  medicalHistory: string;

  @Column({ type: 'text', nullable: true })
  allergies: string;

  @Column({ type: 'text', nullable: true })
  currentMedications: string;

  @Column({ type: 'float', nullable: true })
  sleepHours: number;

  @Column({ nullable: true })
  activityLevel: string;

  @Column({ nullable: true })
  dietPreference: string;

  @Column({ type: 'text', nullable: true })
  bloodReports: string;

  @Column({ type: 'float', nullable: true })
  vitaminD: number;

  @Column({ type: 'float', nullable: true })
  vitaminB12: number;

  @Column({ type: 'float', nullable: true })
  cholesterol: number;

  @Column({ type: 'float', nullable: true })
  fastingSugar: number;

  @Column({ type: 'float', nullable: true })
  hba1c: number;

  @Column({ type: 'int', nullable: true, default: 0 })
  reportFileCount: number;

  @Column({ type: 'text', nullable: true })
  reportFileNames: string;

  @Column({ type: 'text', nullable: true })
  analysisPrompt: string;

  @Column({ type: 'json', nullable: true })
  personalizedHealthReports: any;

  @Column({ type: 'json', nullable: true })
  nutritionInsights: any;

  @Column({ type: 'json', nullable: true })
  customDietGuidance: any;

  @Column({ type: 'json', nullable: true })
  fitnessSuggestions: any;

  @Column({ type: 'json', nullable: true })
  preventiveAlerts: any;

  @Column({ type: 'json', nullable: true })
  nutritionAlerts: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
