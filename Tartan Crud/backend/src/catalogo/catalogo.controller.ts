import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '../common/enums';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CategoriasService } from './categorias.service';
import {
  CreateCategoriaDto,
  CreateInsumoDto,
  CreateProdutoDto,
  MovimentacaoDto,
  UpdateCategoriaDto,
  UpdateInsumoDto,
  UpdateProdutoDto,
} from './dto';
import { EstoqueService } from './estoque.service';
import { ProdutosService } from './produtos.service';

const GESTAO = [UserRole.ADMIN, UserRole.FUNCIONARIO];

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly service: CategoriasService) {}

  // Leitura do cardápio é pública (cliente vê categorias sem login).
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateCategoriaDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateCategoriaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

@Controller('produtos')
export class ProdutosController {
  constructor(private readonly service: ProdutosService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateProdutoDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateProdutoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}

@Controller('estoque')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EstoqueController {
  constructor(private readonly service: EstoqueService) {}

  @Get()
  @Roles(...GESTAO)
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles(...GESTAO)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/historico')
  @Roles(...GESTAO)
  historico(@Param('id') id: string) {
    return this.service.historico(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateInsumoDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateInsumoDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/entrada')
  @Roles(...GESTAO)
  entrada(@Param('id') id: string, @Body() dto: MovimentacaoDto) {
    return this.service.entrada(id, dto);
  }

  @Post(':id/saida')
  @Roles(...GESTAO)
  saida(@Param('id') id: string, @Body() dto: MovimentacaoDto) {
    return this.service.saida(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
