import { Repository } from 'typeorm';
import { Categories } from './categories.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
export declare class CategoriesService {
    private repository;
    constructor(repository: Repository<Categories>);
    getCategories(): Promise<Categories[]>;
    create(dto: CreateCategoryDto): Promise<Categories>;
    findAll(): Promise<Categories[]>;
    findOne(id: number): Promise<Categories>;
    update(id: number, dto: UpdateCategoryDto): Promise<Categories>;
    remove(id: number): Promise<void>;
}
