import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categories } from './categories.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
    constructor(@InjectRepository(Categories) private repository: Repository<Categories>) { }

    async getCategories() {
        const categories: Categories[] = await this.repository.find({ where: { is_active: true } });
        return categories;
    }

    async create(dto: CreateCategoryDto): Promise<Categories> {
        const category = this.repository.create(dto);
        return this.repository.save(category);
    }

    async findAll(): Promise<Categories[]> {
        return this.repository.find({
            where: { is_active: true },
            relations: ["products"],
        });
    }

    async findOne(id: number): Promise<Categories> {
        const category = await this.repository.findOne({
            where: { id },
            relations: ["products"],
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        return category;
    }

    async update(id: number, dto: UpdateCategoryDto): Promise<Categories> {
        const category = await this.findOne(id);

        Object.assign(category, dto);
        return this.repository.save(category);
    }

    async remove(id: number): Promise<void> {
        const category = await this.findOne(id);
        await this.repository.remove(category);
    }
}
