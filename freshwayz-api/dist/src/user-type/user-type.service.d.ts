import { CreateUserTypeDto } from './dto/create-user-type.dto';
import { UpdateUserTypeDto } from './dto/update-user-type.dto';
export declare class UserTypeService {
    create(createUserTypeDto: CreateUserTypeDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateUserTypeDto: UpdateUserTypeDto): string;
    remove(id: number): string;
}
