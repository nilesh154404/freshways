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
