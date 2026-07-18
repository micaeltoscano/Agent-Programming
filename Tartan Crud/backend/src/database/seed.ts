import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { UserRole } from '../common/enums';
import { Categoria } from '../entities/categoria.entity';
import { Cupom } from '../entities/cupom.entity';
import { Endereco } from '../entities/endereco.entity';
import { Insumo } from '../entities/insumo.entity';
import { ItemPedido } from '../entities/item-pedido.entity';
import { MovimentacaoEstoque } from '../entities/movimentacao-estoque.entity';
import { Pagamento } from '../entities/pagamento.entity';
import { Pedido } from '../entities/pedido.entity';
import { ProdutoInsumo } from '../entities/produto-insumo.entity';
import { Produto } from '../entities/produto.entity';
import { Usuario } from '../entities/usuario.entity';
import { buildDbOptions } from './data-source-options';

/**
 * Popula dados mínimos para o Validador: um usuário por perfil, categoria,
 * insumos com estoque baixo (para testar RACE-01), produto com receita e
 * um cupom de valor alto (para testar SEC-01).
 */
async function run() {
  const config = new ConfigService(process.env);
  const options = buildDbOptions(config) as any;
  const ds = new DataSource({
    ...options,
    entities: [
      Usuario,
      Endereco,
      Categoria,
      Produto,
      Insumo,
      ProdutoInsumo,
      Cupom,
      Pedido,
      ItemPedido,
      Pagamento,
      MovimentacaoEstoque,
    ],
  });
  await ds.initialize();

  const usuarios = ds.getRepository(Usuario);
  const senhaHash = await bcrypt.hash('senha123', 10);
  const perfis: Array<[string, string, UserRole]> = [
    ['Admin', 'admin@tartan.com', UserRole.ADMIN],
    ['Funcionario', 'func@tartan.com', UserRole.FUNCIONARIO],
    ['Cozinha', 'cozinha@tartan.com', UserRole.COZINHA],
    ['Motoboy', 'motoboy@tartan.com', UserRole.MOTOBOY],
    ['Cliente', 'cliente@tartan.com', UserRole.CLIENTE],
  ];
  for (const [nome, email, role] of perfis) {
    if (!(await usuarios.findOne({ where: { email } }))) {
      await usuarios.save(usuarios.create({ nome, email, role, senhaHash }));
    }
  }

  const categorias = ds.getRepository(Categoria);
  let cat = await categorias.findOne({ where: { nome: 'Sushi' } });
  if (!cat) cat = await categorias.save(categorias.create({ nome: 'Sushi' }));

  const insumos = ds.getRepository(Insumo);
  let arroz = await insumos.findOne({ where: { nome: 'Arroz' } });
  if (!arroz)
    arroz = await insumos.save(
      insumos.create({ nome: 'Arroz', unidade: 'g', quantidade: '10', estoqueMinimo: '5' }),
    );

  const produtos = ds.getRepository(Produto);
  if (!(await produtos.findOne({ where: { nome: 'Combo Sushi 10un' } }))) {
    const pi = ds.getRepository(ProdutoInsumo).create({ insumo: arroz, quantidade: '10' });
    await produtos.save(
      produtos.create({
        nome: 'Combo Sushi 10un',
        preco: '29.90',
        categoria: cat,
        insumos: [pi],
      }),
    );
  }

  const cupons = ds.getRepository(Cupom);
  if (!(await cupons.findOne({ where: { codigo: 'MEGA50' } }))) {
    await cupons.save(
      cupons.create({ codigo: 'MEGA50', valorDesconto: '50.00', valorMinimoPedido: '0' }),
    );
  }

  // eslint-disable-next-line no-console
  console.log('Seed concluído. Senha padrão: senha123');
  await ds.destroy();
}

run().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
