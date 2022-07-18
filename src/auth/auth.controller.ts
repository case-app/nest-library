import { Controller, Post, Body, Req, Get, Query } from '@nestjs/common'
import { CaseUser } from '../resources/interfaces/case-user.interface'

import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  public async getToken(
    @Body('email') email,
    @Body('password') password
  ): Promise<{
    accessToken: string
    permissions: string[]
    roleName: string
    homepagePath: string
  }> {
    return this.authService.createToken(email, password)
  }

  @Get('me')
  public async getCurrentUser(@Req() req: Promise<CaseUser>) {
    return this.authService.getUserFromToken(req)
  }

  @Get('forgot-password')
  public async forgotPassword(@Query('email') email: string): Promise<any> {
    return this.authService.sendResetPasswordEmail(email)
  }

  @Post('reset-password')
  public async resetPassword(
    @Body('newPassword') newPassword: string,
    @Body('token') token: string
  ) {
    return this.authService.resetPassword(newPassword, token)
  }
}
