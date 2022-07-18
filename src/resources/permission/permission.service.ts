import { Inject, Injectable } from '@nestjs/common'
import { Connection, DataSource, EntityTarget, getRepository } from 'typeorm'
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions'

import { CasePermission } from '../interfaces/case-permission.interface'

@Injectable()
export class PermissionService {
  connection: Connection

  constructor(
    @Inject('PERMISSION')
    private permissionEntity: EntityTarget<CasePermission>,
    @Inject('CONNECTION_OPTIONS')
    private connectionOptions: MysqlConnectionOptions
  ) {
    this.connection = new DataSource(this.connectionOptions)
  }

  index(): Promise<CasePermission[]> {
    return this.connection
      .getRepository(this.permissionEntity)
      .createQueryBuilder('permission')
      .getMany()
  }
}
