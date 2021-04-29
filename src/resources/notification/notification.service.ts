import { Inject, Injectable } from '@nestjs/common'
import * as moment from 'moment'
import { EntityManager, EntityTarget, getManager, getRepository } from 'typeorm'

import { AbacusNotification } from '../interfaces/abacus-notification.interface'
import { AbacusUser } from '../interfaces/abacus-user.interface'

@Injectable()
export class NotificationService {
  entityManager: EntityManager = getManager()
  constructor(
    @Inject('NOTIFICATION')
    private notificationEntity: EntityTarget<AbacusNotification>
  ) {}

  async index(user: AbacusUser) {
    const notifications: AbacusNotification[] = await getRepository(
      this.notificationEntity
    )
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.user', 'user')
      .where('user.id = :userId', { userId: user.id })
      .orderBy('notification.date', 'DESC')
      .take(5)
      .getMany()

    notifications.forEach((notification: AbacusNotification) => {
      notification.isHighlighted = user.lastNotificationCheck
        ? moment(user.lastNotificationCheck).isBefore(moment(notification.date))
        : true

      // Clean response.
      delete notification.user
    })

    return notifications
  }

  async markChecked(user: AbacusUser): Promise<Date> {
    user.lastNotificationCheck = moment().toDate()

    await this.entityManager.save(user)

    return user.lastNotificationCheck
  }

  async notify(
    user: AbacusUser,
    description: string,
    linkPath?: string
  ): Promise<AbacusNotification> {
    const notification: AbacusNotification = getRepository(
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
