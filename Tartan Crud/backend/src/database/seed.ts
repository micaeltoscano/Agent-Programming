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
  const nomesCat = ['Sushi', 'Temaki', 'Yakisoba', 'Bebidas'];
  const mapCat = new Map<string, Categoria>();
  
  for (const nc of nomesCat) {
    let cat = await categorias.findOne({ where: { nome: nc } });
    if (!cat) cat = await categorias.save(categorias.create({ nome: nc }));
    mapCat.set(nc, cat);
  }

  const insumos = ds.getRepository(Insumo);
  
  let arroz = await insumos.findOne({ where: { nome: 'Arroz' } });
  if (!arroz) {
    arroz = insumos.create({ nome: 'Arroz', unidade: 'g', quantidade: '10000', estoqueMinimo: '1000' });
  } else {
    arroz.quantidade = '10000'; // Força 10.000 gramas
  }
  await insumos.save(arroz);

  let salmao = await insumos.findOne({ where: { nome: 'Salmão' } });
  if (!salmao) {
    salmao = insumos.create({ nome: 'Salmão', unidade: 'g', quantidade: '5000', estoqueMinimo: '500' });
  } else {
    salmao.quantidade = '5000'; // Força 5.000 gramas
  }
  await insumos.save(salmao);

  const produtos = ds.getRepository(Produto);
  const pratos = [
    { nome: 'Combo Sushi 10un', preco: '29.90', categoria: mapCat.get('Sushi'), imagem: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&q=80', insumos: [{ insumo: arroz, quantidade: '10' }, { insumo: salmao, quantidade: '50' }] },
    { nome: 'Sushi Salmão Trufado', preco: '39.90', categoria: mapCat.get('Sushi'), imagem: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?w=400&q=80', insumos: [{ insumo: arroz, quantidade: '15' }, { insumo: salmao, quantidade: '60' }] },
    { nome: 'Temaki Filadélfia', preco: '22.50', categoria: mapCat.get('Temaki'), imagem: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&q=80', insumos: [{ insumo: arroz, quantidade: '50' }, { insumo: salmao, quantidade: '80' }] },
    { nome: 'Temaki Skin', preco: '19.90', categoria: mapCat.get('Temaki'), imagem: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80', insumos: [{ insumo: arroz, quantidade: '50' }] },
    { nome: 'Yakisoba Misto', preco: '35.00', categoria: mapCat.get('Yakisoba'), imagem: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=400&q=80', insumos: [] },
    { nome: 'Yakisoba de Frutos do Mar', preco: '45.00', categoria: mapCat.get('Yakisoba'), imagem: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=400&q=80', insumos: [] },
    { nome: 'Refrigerante Cola 350ml', preco: '6.00', categoria: mapCat.get('Bebidas'), imagem: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80', insumos: [] },
    { nome: 'Suco de Laranja Natural', preco: '8.00', categoria: mapCat.get('Bebidas'), imagem: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80', insumos: [] },
  ];

  const piRepo = ds.getRepository(ProdutoInsumo);

  for (const prato of pratos) {
    const existe = await produtos.findOne({ where: { nome: prato.nome } });
    if (!existe) {
      const pInsumos = prato.insumos.map(i => piRepo.create({ insumo: i.insumo, quantidade: i.quantidade }));
      await produtos.save(
        produtos.create({
          nome: prato.nome,
          preco: prato.preco,
          categoria: prato.categoria as Categoria,
          imagem: prato.imagem,
          insumos: pInsumos,
        }),
      );
    } else {
      // Atualiza a imagem e a categoria caso já exista
      existe.imagem = prato.imagem;
      existe.categoria = prato.categoria as Categoria;
      await produtos.save(existe);
    }
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
