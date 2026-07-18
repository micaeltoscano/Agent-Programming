import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Repository } from 'typeorm';
import { Cupom } from '../entities/cupom.entity';

export class CreateCupomDto {
  @IsString()
  codigo: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valorDesconto: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valorMinimoPedido?: number;
}

@Injectable()
export class CupomService {
  constructor(
    @InjectRepository(Cupom)
    private readonly cupons: Repository<Cupom>,
  ) {}

  findAll() {
    return this.cupons.find();
  }

  async create(dto: CreateCupomDto) {
    const existe = await this.cupons.findOne({ where: { codigo: dto.codigo } });
    if (existe) throw new ConflictException('Código de cupom já existe');
    return this.cupons.save(
      this.cupons.create({
        codigo: dto.codigo,
        valorDesconto: dto.valorDesconto.toString(),
        valorMinimoPedido: (dto.valorMinimoPedido ?? 0).toString(),
      }),
    );
  }

  /**
   * Valida um cupom para um subtotal e retorna o desconto EFETIVO aplicável.
   * Regra SEC-01: o desconto nunca pode exceder o subtotal (evita total < 0).
   */
  async validarECalcular(codigo: string, subtotal: number): Promise<{ cupom: Cupom; desconto: number }> {
    const cupom = await this.cupons.findOne({ where: { codigo } });
    if (!cupom || !cupom.ativo) throw new NotFoundException('Cupom inválido');
    if (cupom.validoAte && cupom.validoAte < new Date()) {
      throw new BadRequestException('Cupom expirado');
    }
    if (subtotal < Number(cupom.valorMinimoPedido)) {
      throw new BadRequestException(
        `Cupom exige pedido mínimo de R$ ${Number(cupom.valorMinimoPedido).toFixed(2)}`,
      );
    }
    // Clamp do desconto ao subtotal -> total mínimo R$ 0,00 (SEC-01).
    const desconto = Math.min(Number(cupom.valorDesconto), subtotal);
    return { cupom, desconto };
  }
}
