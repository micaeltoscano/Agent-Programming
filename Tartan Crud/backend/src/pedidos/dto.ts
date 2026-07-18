import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { OrderStatus, PaymentMethod } from '../common/enums';

export class ItemPedidoDto {
  @IsString()
  produtoId: string;

  @IsInt()
  @IsPositive()
  quantidade: number;
}

export class CreatePedidoDto {
  @IsArray()
  @ArrayNotEmpty() // impede carrinho vazio (Validador Fase 4)
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoDto)
  itens: ItemPedidoDto[];

  @IsOptional()
  @IsString()
  cupomCodigo?: string;

  @IsOptional()
  @IsString()
  enderecoEntregaId?: string;

  @IsEnum(PaymentMethod)
  metodoPagamento: PaymentMethod;
}

export class UpdateStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
