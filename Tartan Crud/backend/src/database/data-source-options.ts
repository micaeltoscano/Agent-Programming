import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function buildDbOptions(config: ConfigService): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: config.get<string>('DB_HOST', 'localhost'),
    port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
    username: config.get<string>('DB_USER', 'tartan'),
    password: config.get<string>('DB_PASSWORD', 'tartan'),
    database: config.get<string>('DB_NAME', 'tartan'),
    autoLoadEntities: true,
    // synchronize apenas fora de produção (protótipo acadêmico).
    synchronize: config.get<string>('NODE_ENV') !== 'production',
  };
}
