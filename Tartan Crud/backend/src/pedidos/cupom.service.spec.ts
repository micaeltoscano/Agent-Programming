import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Cupom } from '../entities/cupom.entity';
import { CupomService } from './cupom.service';

/**
 * Cobre a correção SEC-01: o desconto de um cupom nunca pode exceder o
 * subtotal, garantindo que o total do pedido não fique negativo.
 */
describe('CupomService (SEC-01)', () => {
  function makeService(cupom: Partial<Cupom> | null) {
    const repo = {
      findOne: jest.fn().mockResolvedValue(cupom),
    } as any;
    return new CupomService(repo);
  }

  it('faz clamp do desconto ao subtotal (total nunca negativo)', async () => {
    const service = makeService({
      codigo: 'BIG',
      ativo: true,
      valorDesconto: '50.00',
      valorMinimoPedido: '0',
    });
    const { desconto } = await service.validarECalcular('BIG', 20);
    expect(desconto).toBe(20); // limitado ao subtotal, não 50
    expect(20 - desconto).toBeGreaterThanOrEqual(0);
  });

  it('aplica o valor integral quando cabe no subtotal', async () => {
    const service = makeService({
      codigo: 'OK',
      ativo: true,
      valorDesconto: '5.00',
      valorMinimoPedido: '0',
    });
    const { desconto } = await service.validarECalcular('OK', 30);
    expect(desconto).toBe(5);
  });

  it('rejeita cupom inexistente', async () => {
    const service = makeService(null);
    await expect(service.validarECalcular('X', 10)).rejects.toThrow(NotFoundException);
  });

  it('rejeita pedido abaixo do mínimo', async () => {
    const service = makeService({
      codigo: 'MIN',
      ativo: true,
      valorDesconto: '5.00',
      valorMinimoPedido: '25.00',
    });
    await expect(service.validarECalcular('MIN', 10)).rejects.toThrow(BadRequestException);
  });
});
