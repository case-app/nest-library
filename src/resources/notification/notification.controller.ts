import { Controller, Get, Patch, Req } from '@nestjs/common'

import { AuthService } from '../../auth/auth.service'
import { AbacusNotification } from '../interfaces/abacus-notification.interface'
import { AbacusUser } from '../interfaces/abacus-user.interface'
import { NotificationService } from './notification.service'

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService
  ) {}
  @Get('/')
  async index(@Req() req: any): Promise<AbacusNotification[]> {
    const currentUser: AbacusUser = await this.authService.getUserFromToken(req)
    return this.notificationService.index(currentUser)
  }
  @Patch('/mark-checked')
  async markChecked(@Req() req: any): Promise<Date> {
    const currentUser: AbacusUser = await this.authService.getUserFromToken(req)
    return this.notificationService.markChecked(currentUser)
  }
}
