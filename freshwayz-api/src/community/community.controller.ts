import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CommunityService } from './community.service';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';

@ApiTags('Community')
@Controller('community')
export class CommunityController {
    constructor(private readonly communityService: CommunityService) { }

    @Get(':communityId/members')
    async getCommunityMembers(
        @Param('communityId') communityId: number,
    ) {
        return this.communityService.getCommunityMembers(+communityId);
    }
    
    @Get('/customers/:customerId/communities')
    async getMemberCommunities(
        @Param('customerId') customerId: number,
    ) {
        return this.communityService.getMemberCommunities(+customerId);
    }


    @Post()
    @ApiOperation({ summary: 'Create new community' })
    create(@Body() dto: CreateCommunityDto) {
        return this.communityService.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all communities' })
    findAll() {
        return this.communityService.findAll();
    }

    @Get('search')
    @ApiOperation({ summary: 'Search community by name or slug' })
    @ApiQuery({ name: 'keyword', required: true, example: 'green' })
    search(@Query('keyword') keyword: string) {
        return this.communityService.search(keyword);
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
