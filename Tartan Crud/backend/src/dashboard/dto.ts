import { IsOptional, IsISO8601 } from 'class-validator';

/**
 * Intervalo de datas para relatórios. A validação de "data final >= data
 * inicial" (datas invertidas) é feita no service — cenário exploratório do
 * Validador na Fase 6.
 */
export class PeriodoDto {
  @IsOptional()
  @IsISO8601()
  inicio?: string;

  @IsOptional()
  @IsISO8601()
  fim?: string;
}
