import { CategoriesService } from './categories.service';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
export declare class CategoriesController {
    private service;
    constructor(service: CategoriesService);
    getCategories(): Promise<import("./categories.entity").Categories[]>;
    create(dto: CreateCategoryDto): Promise<import("./categories.entity").Categories>;
    findAll(): Promise<import("./categories.entity").Categories[]>;
    findOne(id: number): Promise<import("./categories.entity").Categories>;
    update(id: number, dto: UpdateCategoryDto): Promise<import("./categories.entity").Categories>;
    remove(id: number): Promise<void>;
}
