import { Controller, Post, Body, Res, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';
import { User } from 'src/users/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(body.email, body.password);
    const tokens = await this.authService.login(user as unknown as User);
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      path: '/auth/refresh',
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  //   @Post('refresh')
  //   async refresh(@Body('token') token: string) {
  //     // verify refresh token
  //   }

  @Post('refresh')
  async refresh(@Body() body: { id: number; token: string }) {
    const tokens = await this.authService.rotateRefreshToken(
      body.id,
      body.token,
    );
    return { access: tokens.access, refresh: tokens.refresh };
  }

  @Post('logout')
  async logout(@Body() body: { id: number }) {
    await this.authService.revokeRefreshToken(body.id);
    return { success: true };
  }

  @Get('public-key')
  getPublicKey() {
    return { publicKey: this.authService.getPublicKey() };
  }
}
