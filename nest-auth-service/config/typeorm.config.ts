import { DataSource } from 'typeorm';
import { env } from './env'; // <-- use your file

export default new DataSource({
  type: 'postgres',

  host: env.db.host,
  port: env.db.port,
  username: env.db.username,
  password: env.db.password,
  database: env.db.database,

  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],

  synchronize: false,
  logging: true,
});
