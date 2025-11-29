import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import { env } from '../../config/env';
import { Repository } from 'typeorm';
import { RefreshToken } from 'src/tokens/refresh-token.entity';
import { User } from 'src/users/user.entity';
import * as crypto from 'crypto';
import { JwtSignOptions } from '@nestjs/jwt';

export interface JwtUser {
  id: number;
  email: string;
}

export interface JwtPayload {
  sub: number;
  email: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: { token: string; id: number };
}

@Injectable()
export class AuthService {
  private readonly privateKey: string;
  private readonly publicKey: string;

  constructor(
    @InjectRepository(RefreshToken) private tokenRepo: Repository<RefreshToken>,
    private readonly usersService: UserService,
    private readonly jwt: JwtService,
  ) {
    this.privateKey = fs.readFileSync(env.jwt.privateKeyPath, 'utf8');
    this.publicKey = fs.readFileSync(env.jwt.publicKeyPath, 'utf8');
  }

  async validateUser(email: string, pass: string): Promise<JwtUser> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found');
    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
    return { id: user.id, email: user.email };
  }

  async createAccessToken(user: User): Promise<string> {
    const payload: JwtPayload = { sub: user.id, email: user.email };
    return await this.jwt.signAsync(payload, {
      algorithm: 'RS256',
      privateKey: this.privateKey,
      expiresIn: env.jwt.expiresIn,
    } as JwtSignOptions);
  }

  async createRefreshToken(user: User) {
    const raw = this.generateSecureRandomToken();
    const hash = await bcrypt.hash(raw, 10);
    const expiresAt = new Date(
      Date.now() + this.msFromString(env.jwt.refreshExpiresIn),
    );
    const rt = this.tokenRepo.create({
      user,
      tokenHash: hash,
      expiresAt,
      revoked: false,
    });
    await this.tokenRepo.save(rt);
    return { token: raw, id: rt.id };
  }

  async rotateRefreshToken(tokenId: number, tokenRaw: string) {
    const rt = await this.tokenRepo.findOne({
      where: { id: tokenId },
      relations: ['user'],
    });
    if (!rt || rt.revoked)
      throw new UnauthorizedException('Invalid refresh token');
    const match = await bcrypt.compare(tokenRaw, rt.tokenHash);
    if (!match) {
      rt.revoked = true;
      await this.tokenRepo.save(rt);
      throw new UnauthorizedException('Invalid refresh token');
    }
    rt.revoked = true;
    await this.tokenRepo.save(rt);
    const newRefresh = await this.createRefreshToken(rt.user);
    const access = await this.createAccessToken(rt.user);
    return { access, refresh: newRefresh };
  }

  async revokeRefreshToken(tokenId: number) {
    await this.tokenRepo.update({ id: tokenId }, { revoked: true });
  }

  private generateSecureRandomToken() {
    return crypto.randomBytes(64).toString('hex');
  }

  private msFromString(str: string) {
    if (str.endsWith('d')) return parseInt(str) * 24 * 3600 * 1000;
    if (str.endsWith('h')) return parseInt(str) * 3600 * 1000;
    return parseInt(str) * 1000;
  }

  async login(user: User): Promise<TokenResponse> {
    const accessToken = await this.createAccessToken(user);
    const refreshToken = await this.createRefreshToken(user);
    return { accessToken, refreshToken };
  }

  async getPublicKey(): Promise<string> {
    return Promise.resolve(this.publicKey.toString());
  }
}
