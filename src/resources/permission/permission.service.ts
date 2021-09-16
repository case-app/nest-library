import { Inject, Injectable } from '@nestjs/common'
import { EntityTarget, getRepository } from 'typeorm'

import { CasePermission } from '../interfaces/case-permission.interface'

@Injectable()
export class PermissionService {
  constructor(
    @Inject('PERMISSION')
    private permissionEntity: EntityTarget<CasePermission>
  ) {}

  index(): Promise<CasePermission[]> {
    return getRepository(this.permissionEntity)
      .createQueryBuilder('permission')
      .getMany()
  }
}
