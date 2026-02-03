import { Auth } from "src/auth/entities/auth.entity";
import { UserType } from "src/user-type/entities/user-type.entity";
export declare class User {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    nickname: string;
    bio: string;
    whatsapp: string;
    telegram: string;
    website: string;
    userType: UserType;
    auth?: Auth;
    createdAt: Date;
    updatedAt: Date;
}
