import { DiscountType } from '../entities/discount-type.enum';
export declare class CreateProductDiscountDto {
    type: DiscountType;
    value?: number;
    buyQuantity?: number;
    getQuantity?: number;
    minCartQuantity: number;
    startDate: Date;
    endDate: Date;
    isActive?: boolean;
    productId: number;
}
