import { User } from "src/user/entities/user.entity";
import { Vendor } from "src/vendor/entities/vendor.entity";
export declare class UserType {
    id: number;
    typeName: string;
    description: string;
    users: User[];
    vendors: Vendor[];
    createdAt: Date;
    updatedAt: Date;
}
