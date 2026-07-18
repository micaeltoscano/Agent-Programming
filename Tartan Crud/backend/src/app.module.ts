import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CatalogoModule } from './catalogo/catalogo.module';
import { ChatModule } from './chat/chat.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { buildDbOptions } from './database/data-source-options';
import { PedidosModule } from './pedidos/pedidos.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => buildDbOptions(config),
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100, // global limit 100 requests per minute
    }]),
    AuthModule,
    CatalogoModule,
    PedidosModule,
    DashboardModule,
    ChatModule,
    EventsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ]
})
export class AppModule {}
