import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CommunityService } from './community.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { RangeDTO } from 'src/helpers/pagination/dto/range.dto';

@ApiTags('Community')
@Controller('community')
export class CommunityController {
    constructor(private readonly communityService: CommunityService) { }

    @Get(':communityId/members')
    @ApiOperation({ summary: 'Get community members with pagination' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getCommunityMembers(
        @Param('communityId') communityId: number,
        @Query() dto: RangeDTO,
    ) {
        return this.communityService.getCommunityMembers(+communityId, dto);
    }
    
    @Get('/customers/:customerId/communities')
    @ApiOperation({ summary: 'Get member communities with pagination' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getMemberCommunities(
        @Param('customerId') customerId: number,
        @Query() dto: RangeDTO,
    ) {
        return this.communityService.getMemberCommunities(+customerId, dto);
    }


    @Post()
    @ApiOperation({ summary: 'Create new community' })
    create(@Body() dto: CreateCommunityDto) {
        return this.communityService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all communities with pagination' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    findAll(@Query() dto: RangeDTO) {
        return this.communityService.findAll(dto);
    }

    @Get('search')
    @ApiOperation({ summary: 'Search community by name or slug with pagination' })
    @ApiQuery({ name: 'keyword', required: true, example: 'green' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    search(
        @Query('keyword') keyword: string,
        @Query() dto: RangeDTO,
    ) {
        return this.communityService.search(keyword, dto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a single community by ID' })
    findOne(@Param('id') id: string) {
        return this.communityService.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update community by ID' })
    update(@Param('id') id: string, @Body() dto: UpdateCommunityDto) {
        return this.communityService.update(+id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a community' })
    remove(@Param('id') id: string) {
        return this.communityService.remove(+id);
    }
}
