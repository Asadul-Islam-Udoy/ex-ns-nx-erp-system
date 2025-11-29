import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/users/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { env } from 'config/env';
import * as fs from 'fs';
import { RefreshToken } from 'src/tokens/refresh-token.entity';

@Module({
  imports: [
    UserModule,
    PassportModule,
    TypeOrmModule.forFeature([RefreshToken]), // <-- ADD THIS
    JwtModule.register({
      privateKey: fs.readFileSync(env.jwt.privateKeyPath, 'utf8'),
      publicKey: fs.readFileSync(env.jwt.publicKeyPath, 'utf8'),
      signOptions: {
        algorithm: 'RS256',
        expiresIn: 60 * 15,
      },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
