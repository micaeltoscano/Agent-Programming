import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDB1784406407135 implements MigrationInterface {
    name = 'InitDB1784406407135'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "enderecos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "logradouro" character varying NOT NULL, "numero" character varying NOT NULL, "complemento" character varying, "bairro" character varying NOT NULL, "cidade" character varying NOT NULL DEFAULT 'João Pessoa', "cep" character varying, "usuarioId" uuid, CONSTRAINT "PK_208b05002dcdf7bfbad378dcac1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cupons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "codigo" character varying NOT NULL, "valorDesconto" numeric(10,2) NOT NULL, "valorMinimoPedido" numeric(10,2) NOT NULL DEFAULT '0', "ativo" boolean NOT NULL DEFAULT true, "validoAte" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_252bc40922061270d3eed03b142" UNIQUE ("codigo"), CONSTRAINT "PK_a391ecb025ec40b07972ed7de19" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "categorias" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying NOT NULL, "descricao" character varying, CONSTRAINT "UQ_de8a2d8979f7820616e31dc1e15" UNIQUE ("nome"), CONSTRAINT "PK_3886a26251605c571c6b4f861fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "insumos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying NOT NULL, "unidade" character varying NOT NULL DEFAULT 'un', "quantidade" numeric(12,3) NOT NULL DEFAULT '0', "estoqueMinimo" numeric(12,3) NOT NULL DEFAULT '0', "versao" integer NOT NULL, CONSTRAINT "UQ_cdea53a477f8abc823c76e43cc1" UNIQUE ("nome"), CONSTRAINT "PK_b4e1b727a7b140e698e3a3dc7af" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "produto_insumos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantidade" numeric(12,3) NOT NULL, "produtoId" uuid, "insumoId" uuid, CONSTRAINT "UQ_ffd99739844bdf6649a7c390f56" UNIQUE ("produtoId", "insumoId"), CONSTRAINT "PK_bb7448bda92d85b86bda903171d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "produtos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying NOT NULL, "descricao" text, "preco" numeric(10,2) NOT NULL, "imagem" text, "disponivel" boolean NOT NULL DEFAULT true, "categoriaId" uuid, CONSTRAINT "PK_a5d976312809192261ed96174f3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "itens_pedido" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantidade" integer NOT NULL, "precoUnitario" numeric(10,2) NOT NULL, "pedidoId" uuid, "produtoId" uuid, CONSTRAINT "PK_34ba752329a604381e367c431ff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."pagamentos_metodo_enum" AS ENUM('DINHEIRO', 'CARTAO', 'PIX')`);
        await queryRunner.query(`CREATE TYPE "public"."pagamentos_status_enum" AS ENUM('PENDENTE', 'PAGO', 'ESTORNADO')`);
        await queryRunner.query(`CREATE TABLE "pagamentos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "metodo" "public"."pagamentos_metodo_enum" NOT NULL, "status" "public"."pagamentos_status_enum" NOT NULL DEFAULT 'PENDENTE', "valor" numeric(10,2) NOT NULL, "criadoEm" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "pedidoId" uuid, CONSTRAINT "REL_e8c4f5ace7785fbee73279c10d" UNIQUE ("pedidoId"), CONSTRAINT "PK_0127f8bc8386b0e522c7cc5a9fc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."pedidos_status_enum" AS ENUM('PENDENTE', 'CONFIRMADO', 'EM_PRODUCAO', 'PRONTO', 'A_CAMINHO', 'ENTREGUE', 'CANCELADO')`);
        await queryRunner.query(`CREATE TABLE "pedidos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."pedidos_status_enum" NOT NULL DEFAULT 'PENDENTE', "subtotal" numeric(10,2) NOT NULL DEFAULT '0', "desconto" numeric(10,2) NOT NULL DEFAULT '0', "total" numeric(10,2) NOT NULL DEFAULT '0', "criadoEm" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "atualizadoEm" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "clienteId" uuid, "cupomId" uuid, "enderecoEntregaId" uuid, "motoboyId" uuid, CONSTRAINT "PK_ebb5680ed29a24efdc586846725" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."usuarios_role_enum" AS ENUM('ADMIN', 'FUNCIONARIO', 'COZINHA', 'MOTOBOY', 'CLIENTE')`);
        await queryRunner.query(`CREATE TABLE "usuarios" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "nome" character varying NOT NULL, "email" character varying NOT NULL, "senhaHash" character varying NOT NULL, "role" "public"."usuarios_role_enum" NOT NULL DEFAULT 'CLIENTE', "telefone" character varying, "ativo" boolean NOT NULL DEFAULT true, "criadoEm" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "atualizadoEm" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5" UNIQUE ("email"), CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."movimentacoes_estoque_tipo_enum" AS ENUM('ENTRADA', 'SAIDA', 'AJUSTE', 'ESTORNO')`);
        await queryRunner.query(`CREATE TABLE "movimentacoes_estoque" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tipo" "public"."movimentacoes_estoque_tipo_enum" NOT NULL, "quantidade" numeric(12,3) NOT NULL, "referenciaPedidoId" character varying, "observacao" character varying, "criadoEm" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "insumoId" uuid, CONSTRAINT "PK_6051e7ea0b5fe0e0b22f1a56d33" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "enderecos" ADD CONSTRAINT "FK_3fda1857bc40b2c12b9562101ac" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "produto_insumos" ADD CONSTRAINT "FK_d294d3aaf342f36132f5ff90695" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "produto_insumos" ADD CONSTRAINT "FK_622a556ac3c9f4f275b50917bb4" FOREIGN KEY ("insumoId") REFERENCES "insumos"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "produtos" ADD CONSTRAINT "FK_8a509e69a8c1575d0247844daec" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "itens_pedido" ADD CONSTRAINT "FK_ab2b96858c45196d22cce672215" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "itens_pedido" ADD CONSTRAINT "FK_496c47b9befb817d2595f65a901" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pagamentos" ADD CONSTRAINT "FK_e8c4f5ace7785fbee73279c10d4" FOREIGN KEY ("pedidoId") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pedidos" ADD CONSTRAINT "FK_485346a40b61bb8ae3a98f5400c" FOREIGN KEY ("clienteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pedidos" ADD CONSTRAINT "FK_053245dc2b9b930b5df82c9734e" FOREIGN KEY ("cupomId") REFERENCES "cupons"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pedidos" ADD CONSTRAINT "FK_10fd9f8ea102e0ebe5c98323378" FOREIGN KEY ("enderecoEntregaId") REFERENCES "enderecos"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pedidos" ADD CONSTRAINT "FK_d36f4087b1f25b62ab69c70fb70" FOREIGN KEY ("motoboyId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "FK_7b2e24d68171f29b6fad28a47c2" FOREIGN KEY ("insumoId") REFERENCES "insumos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "movimentacoes_estoque" DROP CONSTRAINT "FK_7b2e24d68171f29b6fad28a47c2"`);
        await queryRunner.query(`ALTER TABLE "pedidos" DROP CONSTRAINT "FK_d36f4087b1f25b62ab69c70fb70"`);
        await queryRunner.query(`ALTER TABLE "pedidos" DROP CONSTRAINT "FK_10fd9f8ea102e0ebe5c98323378"`);
        await queryRunner.query(`ALTER TABLE "pedidos" DROP CONSTRAINT "FK_053245dc2b9b930b5df82c9734e"`);
        await queryRunner.query(`ALTER TABLE "pedidos" DROP CONSTRAINT "FK_485346a40b61bb8ae3a98f5400c"`);
        await queryRunner.query(`ALTER TABLE "pagamentos" DROP CONSTRAINT "FK_e8c4f5ace7785fbee73279c10d4"`);
        await queryRunner.query(`ALTER TABLE "itens_pedido" DROP CONSTRAINT "FK_496c47b9befb817d2595f65a901"`);
        await queryRunner.query(`ALTER TABLE "itens_pedido" DROP CONSTRAINT "FK_ab2b96858c45196d22cce672215"`);
        await queryRunner.query(`ALTER TABLE "produtos" DROP CONSTRAINT "FK_8a509e69a8c1575d0247844daec"`);
        await queryRunner.query(`ALTER TABLE "produto_insumos" DROP CONSTRAINT "FK_622a556ac3c9f4f275b50917bb4"`);
        await queryRunner.query(`ALTER TABLE "produto_insumos" DROP CONSTRAINT "FK_d294d3aaf342f36132f5ff90695"`);
        await queryRunner.query(`ALTER TABLE "enderecos" DROP CONSTRAINT "FK_3fda1857bc40b2c12b9562101ac"`);
        await queryRunner.query(`DROP TABLE "movimentacoes_estoque"`);
        await queryRunner.query(`DROP TYPE "public"."movimentacoes_estoque_tipo_enum"`);
        await queryRunner.query(`DROP TABLE "usuarios"`);
        await queryRunner.query(`DROP TYPE "public"."usuarios_role_enum"`);
        await queryRunner.query(`DROP TABLE "pedidos"`);
        await queryRunner.query(`DROP TYPE "public"."pedidos_status_enum"`);
        await queryRunner.query(`DROP TABLE "pagamentos"`);
        await queryRunner.query(`DROP TYPE "public"."pagamentos_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."pagamentos_metodo_enum"`);
        await queryRunner.query(`DROP TABLE "itens_pedido"`);
        await queryRunner.query(`DROP TABLE "produtos"`);
        await queryRunner.query(`DROP TABLE "produto_insumos"`);
        await queryRunner.query(`DROP TABLE "insumos"`);
        await queryRunner.query(`DROP TABLE "categorias"`);
        await queryRunner.query(`DROP TABLE "cupons"`);
        await queryRunner.query(`DROP TABLE "enderecos"`);
    }

}
