import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../common/enums';
import { CreateCupomDto, CupomService } from './cupom.service';
import { CreatePedidoDto, UpdateStatusDto } from './dto';
import { PedidosService } from './pedidos.service';

@Controller('pedidos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PedidosController {
  constructor(private readonly service: PedidosService) {}

  @Post()
  @Roles(UserRole.CLIENTE, UserRole.ADMIN, UserRole.FUNCIONARIO)
  criar(@Body() dto: CreatePedidoDto, @CurrentUser() user: AuthUser) {
    return this.service.criar(dto, user);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.service.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.findOne(id, user);
  }

  @Patch(':id/status')
  atualizarStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.atualizarStatus(id, dto.status, user);
  }
}

@Controller('cupons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CuponsController {
  constructor(private readonly service: CupomService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.FUNCIONARIO)
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateCupomDto) {
    return this.service.create(dto);
  }
}
