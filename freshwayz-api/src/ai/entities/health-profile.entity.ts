import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class HealthProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', unique: true })
  userId: number;


  @Column({ type: 'float' })
  heightCm: number;

  @Column({ type: 'float' })
  weightKg: number;

  @Column({ type: 'float', nullable: true })
  height: number;

  @Column({ default: 'cm' })
  heightUnit: string;

  @Column({ type: 'float', nullable: true })
  bmi: number;

  @Column({ nullable: true })
  goal: string;

  @Column({ type: 'text', nullable: true })
  analysisPrompt: string;

  @Column({ nullable: true })
  bloodGroup: string;

  @Column({ type: 'text', nullable: true })
  medicalInformation: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
