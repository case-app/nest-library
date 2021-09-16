import { Inject, Injectable } from '@nestjs/common'
import * as moment from 'moment'
import { EntityManager, EntityTarget, getManager, getRepository } from 'typeorm'

import { CaseNotification } from '../interfaces/case-notification.interface'
import { CaseUser } from '../interfaces/case-user.interface'

@Injectable()
export class NotificationService {
  entityManager: EntityManager = getManager()
  constructor(
    @Inject('NOTIFICATION')
    private notificationEntity: EntityTarget<CaseNotification>
  ) {}

  async index(user: CaseUser) {
    const notifications: CaseNotification[] = await getRepository(
      this.notificationEntity
    )
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.user', 'user')
      .where('user.id = :userId', { userId: user.id })
      .orderBy('notification.date', 'DESC')
      .take(5)
      .getMany()

    notifications.forEach((notification: CaseNotification) => {
      notification.isHighlighted = user.lastNotificationCheck
        ? moment(user.lastNotificationCheck).isBefore(moment(notification.date))
        : true

      // Clean response.
      delete notification.user
    })

    return notifications
  }

  async markChecked(user: CaseUser): Promise<Date> {
    user.lastNotificationCheck = moment().toDate()

    await this.entityManager.save(user)

    return user.lastNotificationCheck
  }

  async notify(
    user: CaseUser,
    description: string,
    linkPath?: string
  ): Promise<CaseNotification> {
    const notification: CaseNotification = getRepository(
      this.notificationEntity
    ).create({
      description,
      user,
      linkPath: linkPath || null,
      date: moment().toDate()
    })
    return await getRepository(this.notificationEntity).save(notification)
  }
}
