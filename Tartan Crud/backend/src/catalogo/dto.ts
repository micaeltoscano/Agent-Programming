import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CreateCategoriaDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nome: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  descricao?: string;
}

export class UpdateCategoriaDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nome?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  descricao?: string;
}

export class ProdutoInsumoDto {
  @IsString()
  insumoId: string;

  // qtd consumida por unidade do produto — deve ser positiva
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  quantidade: number;
}

export class CreateProdutoDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120) // impede nomes com milhares de caracteres (Validador Fase 3)
  nome: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descricao?: string;

  // impede preços negativos (Validador Fase 3)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  preco: number;

  @IsString()
  categoriaId: string;

  @IsOptional()
  @IsBoolean()
  disponivel?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProdutoInsumoDto)
  insumos?: ProdutoInsumoDto[];
}

export class UpdateProdutoDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nome?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descricao?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  preco?: number;

  @IsOptional()
  @IsString()
  categoriaId?: string;

  @IsOptional()
  @IsBoolean()
  disponivel?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProdutoInsumoDto)
  insumos?: ProdutoInsumoDto[];
}

export class CreateInsumoDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nome: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  unidade?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  quantidade?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  estoqueMinimo?: number;
}

export class UpdateInsumoDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nome?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  unidade?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0)
  estoqueMinimo?: number;
}

/** Movimentação manual de estoque (entrada/saída/ajuste). */
export class MovimentacaoDto {
  @IsNumber({ maxDecimalPlaces: 3 })
  @IsPositive()
  quantidade: number;

  @IsOptional()
  @IsString()
  observacao?: string;
}
