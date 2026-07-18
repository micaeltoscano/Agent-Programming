import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../common/enums';
import { DashboardService } from './dashboard.service';
import { PeriodoDto } from './dto';

/** Dashboards e relatórios são restritos a Admin/Funcionário (critério i). */
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.FUNCIONARIO)
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('resumo')
  resumo(@Query() periodo: PeriodoDto) {
    return this.service.resumo(periodo);
  }

  @Get('mais-vendidos')
  maisVendidos(@Query() periodo: PeriodoDto) {
    return this.service.maisVendidos(periodo);
  }

  @Get('vendas-por-bairro')
  vendasPorBairro(@Query() periodo: PeriodoDto) {
    return this.service.vendasPorBairro(periodo);
  }

  @Get('faturamento-diario')
  faturamentoDiario(@Query() periodo: PeriodoDto) {
    return this.service.faturamentoDiario(periodo);
  }
}
