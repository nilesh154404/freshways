import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { CategoriesService } from './categories.service';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoriesController {
    constructor(private service: CategoriesService) { }

    @Get('get-categories')
    async getCategories() {
        return await this.service.getCategories();
    }

    @Post()
    create(@Body() dto: CreateCategoryDto) {
        return this.service.create(dto);
    }

    @Get()
    findAll() {
        return this.service.findAll();
    }

    @Get(":id")
    findOne(@Param("id") id: number) {
        return this.service.findOne(+id);
    }

    @Patch(":id")
    update(
        @Param("id") id: number,
        @Body() dto: UpdateCategoryDto,
    ) {
        return this.service.update(+id, dto);
    }

    @Delete(":id")
    remove(@Param("id") id: number) {
        return this.service.remove(+id);
    }
}
