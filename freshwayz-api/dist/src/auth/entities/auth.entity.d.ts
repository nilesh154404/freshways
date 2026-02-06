import { Customer } from "src/customer/entities/customer.entity";
import { User } from "src/user/entities/user.entity";
import { Vendor } from "src/vendor/entities/vendor.entity";
export declare class Auth {
    id: number;
    username: string;
    password: string;
    user?: User;
    vendor?: Vendor;
    customer?: Customer;
    createdAt: Date;
    updatedAt: Date;
}
