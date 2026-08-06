import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ProductCustomizationGroup } from './product-customization-group.entity';

@Entity()
export class ProductCustomizationOption {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ProductCustomizationGroup, group => group.options, { onDelete: 'CASCADE' })
    group: ProductCustomizationGroup;

    @Column()
    name: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    additionalPrice: number;

    @Column({ default: 0 })
    displayOrder: number;

    @Column({ default: true })
    status: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
