import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const typeOrmTestConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'root',
  database: 'test_task_db',
  entities: ['dist/**/*.entity{.ts,.js}'],
  synchronize: true,
};

export { typeOrmTestConfig };
