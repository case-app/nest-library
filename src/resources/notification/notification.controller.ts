import { Controller, Get, Patch, Req } from '@nestjs/common'

import { AuthService } from '../../auth/auth.service'
import { CaseNotification } from '../interfaces/case-notification.interface'
import { CaseUser } from '../interfaces/case-user.interface'
import { NotificationService } from './notification.service'

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService
  ) {}

  @Get('/')
  async index(@Req() req: any): Promise<CaseNotification[]> {
    const currentUser: CaseUser = await this.authService.getUserFromToken(req)
    return this.notificationService.index(currentUser)
  }

  @Patch('/mark-checked')
  async markChecked(@Req() req: any): Promise<Date> {
    const currentUser: CaseUser = await this.authService.getUserFromToken(req)
    return this.notificationService.markChecked(currentUser)
  }
}
