import { UserTypeService } from './user-type.service';
import { CreateUserTypeDto } from './dto/create-user-type.dto';
import { UpdateUserTypeDto } from './dto/update-user-type.dto';
export declare class UserTypeController {
    private readonly userTypeService;
    constructor(userTypeService: UserTypeService);
    create(createUserTypeDto: CreateUserTypeDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateUserTypeDto: UpdateUserTypeDto): string;
    remove(id: string): string;
}
