import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Product } from './product.entity';
import { ProductCustomizationOption } from './product-customization-option.entity';

export enum SelectionType {
    SINGLE = 'SINGLE',
    MULTIPLE = 'MULTIPLE',
}

@Entity()
export class ProductCustomizationGroup {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Product, product => product.customizationGroups, { onDelete: 'CASCADE' })
    product: Product;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: SelectionType,
        default: SelectionType.SINGLE
    })
    selectionType: SelectionType;

    @Column({ default: false })
    isRequired: boolean;

    @Column({ default: 0 })
    displayOrder: number;

    @Column({ default: true })
    status: boolean;

    @OneToMany(() => ProductCustomizationOption, option => option.group, { cascade: true })
    options: ProductCustomizationOption[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
