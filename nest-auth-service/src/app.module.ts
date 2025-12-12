import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './users/user.entity';
import { AuthModule } from './auth/auth.module';
import * as bcrypt from 'bcrypt';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // ✅ loads .env automatically
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('POSTGRES_HOST'),
        port: +config.get('POSTGRES_PORT'),
        username: config.get('POSTGRES_USER'),
        password: config.get('POSTGRES_PASSWORD'),
        database: config.get('POSTGRES_DB'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User]),
    AuthModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) { }

  async onModuleInit() {
    const existing = await this.userRepository.findOne({
      where: { role: UserRole.SUPER_ADMIN },
    });

    if (!existing) {
      const password = await bcrypt.hash('superadmin123', 10);
      const superAdmin = this.userRepository.create({
        name: 'Super Admin',
        email: 'superadmin@example.com',
        password,
        role: UserRole.SUPER_ADMIN,
      });
      await this.userRepository.save(superAdmin);
      console.log('✅ Super admin created!');
    } else {
      console.log('🟢 Super admin already exists.');
    }
  }
}
