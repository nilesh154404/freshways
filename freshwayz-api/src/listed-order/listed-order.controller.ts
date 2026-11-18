import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ListedOrderService } from './listed-order.service';
import { CreateListedOrderDto } from './dto/create-listed-order.dto';
import { UpdateListedOrderDto } from './dto/update-listed-order.dto';
import { ApiTags, ApiCreatedResponse, ApiOkResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ListedOrder } from './entities/listed-order.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RangeDTO } from 'src/helpers/pagination/dto/range.dto';

@ApiTags('listed-orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin', 'Super Admin', 'Vendor')
@Controller('listed-orders')
export class ListedOrderController {
  constructor(private readonly listedOrdersService: ListedOrderService) {}

  @Get()
  @ApiOkResponse({ description: 'Paginated listed orders' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Req() req: any, @Query() dto: RangeDTO) {
    return this.listedOrdersService.findAll(req.user, dto);
  }

  @Get(':id')
  @ApiOkResponse({ type: ListedOrder })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.listedOrdersService.findOne(id, req.user);
  }

  @Post()
  @ApiCreatedResponse({ type: ListedOrder })
  create(@Body() dto: CreateListedOrderDto) {
    return this.listedOrdersService.create(dto);
  }

  @Patch(':id')
  @ApiOkResponse({ type: ListedOrder })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateListedOrderDto,
    @Req() req: any,
  ) {
    return this.listedOrdersService.update(id, dto, req.user);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Deleted successfully' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.listedOrdersService.remove(id, req.user);
  }
}
