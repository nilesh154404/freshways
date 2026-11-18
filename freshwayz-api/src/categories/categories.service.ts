import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categories } from './categories.entity';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { paginate, PaginatedResponse } from 'src/helpers/pagination/pagination';
import { RangeDTO } from 'src/helpers/pagination/dto/range.dto';

@Injectable()
export class CategoriesService {
    constructor(@InjectRepository(Categories) private repository: Repository<Categories>) { }

    private normalizeCategory(category: Categories): Categories {
        if (!category) return category;
        if (category.img_link) {
            category.img_link = category.img_link
                .replace(/https?:\/\/freshwayz\.dexpertsystems\.com\/uploads/g, 'https://admin.freshwayz.dexpertsystems.com/uploads')
                .replace(/http:\/\/192\.168\.\d+\.\d+:\d+\/uploads/g, 'https://admin.freshwayz.dexpertsystems.com/uploads')
                .replace(/http:\/\/localhost:\d+\/uploads/g, 'https://admin.freshwayz.dexpertsystems.com/uploads');
        }
        if (category.products && Array.isArray(category.products)) {
            category.products.forEach(p => {
                if (p && p.productUrl) {
                    p.productUrl = p.productUrl
                        .replace(/https?:\/\/freshwayz\.dexpertsystems\.com\/uploads/g, 'https://admin.freshwayz.dexpertsystems.com/uploads')
                        .replace(/http:\/\/192\.168\.\d+\.\d+:\d+\/uploads/g, 'https://admin.freshwayz.dexpertsystems.com/uploads')
                        .replace(/http:\/\/localhost:\d+\/uploads/g, 'https://admin.freshwayz.dexpertsystems.com/uploads');
                }
            });
        }
        return category;
    }

    async getCategories(dto?: RangeDTO): Promise<PaginatedResponse<Categories>> {
        const qb = this.repository.createQueryBuilder('category')
            .where('category.is_active = :active', { active: true })
            .orderBy('category.id', 'ASC');

        const result = await paginate(qb, dto);
        return {
            data: result.data.map(c => this.normalizeCategory(c)),
            pagination: result.pagination,
        };
    }

    async create(dto: CreateCategoryDto): Promise<Categories> {
        const category = this.repository.create(dto);
        const saved = await this.repository.save(category);
        return this.normalizeCategory(saved);
    }

    async findAll(dto?: RangeDTO): Promise<PaginatedResponse<Categories>> {
        const qb = this.repository.createQueryBuilder('category')
            .where('category.is_active = :active', { active: true })
            .orderBy('category.id', 'ASC');

        const result = await paginate(qb, dto);
        return {
            data: result.data.map(c => this.normalizeCategory(c)),
            pagination: result.pagination,
        };
    }

    async findOne(id: number): Promise<Categories> {
        const category = await this.repository.findOne({
            where: { id },
            relations: ["products"],
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        return this.normalizeCategory(category);
    }

    async update(id: number, dto: UpdateCategoryDto): Promise<Categories> {
        const category = await this.findOne(id);

        Object.assign(category, dto);
        return this.repository.save(category);
    }

    async remove(id: number): Promise<void> {
        const category = await this.findOne(id);
        category.is_active = false;
        await this.repository.save(category);
    }
}
