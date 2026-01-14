import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ListedOrderService } from './listed-order.service';
import { CreateListedOrderDto } from './dto/create-listed-order.dto';
import { UpdateListedOrderDto } from './dto/update-listed-order.dto';
import { ApiTags, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { ListedOrder } from './entities/listed-order.entity';

@ApiTags('listed-orders')
@Controller('listed-orders')
export class ListedOrderController {
  constructor(private readonly listedOrdersService: ListedOrderService) {}

  @Get()
  @ApiOkResponse({ type: [ListedOrder] })
  findAll() {
    return this.listedOrdersService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: ListedOrder })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.listedOrdersService.findOne(id);
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
  ) {
    return this.listedOrdersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Deleted successfully' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.listedOrdersService.remove(id);
  }
}
