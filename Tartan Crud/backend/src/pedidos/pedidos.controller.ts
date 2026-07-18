import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
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
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
  ) {
    return this.service.findAll(user, take ? parseInt(take, 10) : 50, skip ? parseInt(skip, 10) : 0);
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

  @Post('abandoned-cart')
  @Roles(UserRole.CLIENTE, UserRole.ADMIN, UserRole.FUNCIONARIO)
  async abandonedCart(@Body() dto: any, @CurrentUser() user: AuthUser) {
    // Simula a automação de disparo via WhatsApp
    const consoleLogger = new (require('@nestjs/common').Logger)('WhatsAppAutomation');
    consoleLogger.log(`[WHATSAPP] Olá ${user.email}! Vimos que você deixou itens no carrinho do Tartan. Volte e finalize com o cupom VOLTE10!`);
    return { success: true, message: 'Automação de WhatsApp engatilhada.' };
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
