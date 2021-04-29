import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions'

export interface AbacusOptions {
  userEntity: any
  notificationEntity: any
  permissionEntity: any
  roleEntity: any

  connectionOptions: MysqlConnectionOptions
}
