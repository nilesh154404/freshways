import { Auth } from "src/auth/entities/auth.entity";
import { Community } from "src/community/entities/community.entity";
import { Order } from "src/orders/entities/order.entity";
import { Subscription } from "src/subscription/entities/subscription.entity";
import { UserType } from "src/user-type/entities/user-type.entity";
export declare class Customer {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    dob: Date;
    gender: string;
    bloodGroup: string;
    height: number;
    weight: number;
    medicalHistory: string;
    goal: string;
    community: string;
    landmark: string;
    locality: string;
    userType: UserType;
    auth: Auth;
    subscriptions: Subscription[];
    orders: Order[];
    createdAt: Date;
    updatedAt: Date;
    communities: Community[];
}
