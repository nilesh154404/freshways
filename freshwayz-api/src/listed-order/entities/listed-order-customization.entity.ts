import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ListedOrder } from './listed-order.entity';
import { ProductCustomizationGroup } from 'src/products/entities/product-customization-group.entity';
import { ProductCustomizationOption } from 'src/products/entities/product-customization-option.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class ListedOrderCustomization {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => ListedOrder, listedOrder => listedOrder.customizations, { onDelete: 'CASCADE' })
    @Exclude()
    listedOrder: ListedOrder;

    @ManyToOne(() => ProductCustomizationGroup, { nullable: true, onDelete: 'SET NULL' })
    customizationGroup: ProductCustomizationGroup;

    @ManyToOne(() => ProductCustomizationOption, { nullable: true, onDelete: 'SET NULL' })
    customizationOption: ProductCustomizationOption;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    additionalPrice: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
