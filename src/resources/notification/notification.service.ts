import { Inject, Injectable } from '@nestjs/common'
import * as moment from 'moment'
import { Connection, DataSource, EntityTarget, getRepository } from 'typeorm'
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions'

import { CaseNotification } from '../interfaces/case-notification.interface'
import { CaseUser } from '../interfaces/case-user.interface'

@Injectable()
export class NotificationService {
  connection: Connection

  constructor(
    @Inject('NOTIFICATION')
    private notificationEntity: EntityTarget<CaseNotification>,
    @Inject('USER')
    private userEntity: EntityTarget<CaseUser>,
    @Inject('CONNECTION_OPTIONS')
    private connectionOptions: MysqlConnectionOptions
  ) {
    this.connection = new DataSource(this.connectionOptions)
  }

  async index(user: CaseUser) {
    const notifications: CaseNotification[] = await this.connection
      .getRepository(this.notificationEntity)
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

    await this.connection.getRepository(this.userEntity).save(user)

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
    return this.connection
      .getRepository(this.notificationEntity)
      .save(notification)
  }
}
