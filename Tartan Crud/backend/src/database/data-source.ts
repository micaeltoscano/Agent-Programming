import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config(); // Load .env file

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  username: process.env.DB_USER || 'tartan',
  password: process.env.DB_PASSWORD || 'tartan',
  database: process.env.DB_NAME || 'tartan',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
