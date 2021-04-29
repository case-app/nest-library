import { Inject, Injectable } from '@nestjs/common'
import { EntityTarget, getRepository } from 'typeorm'

import { AbacusPermission } from '../interfaces/abacus-permission.interface'

@Injectable()
export class PermissionService {
  constructor(
    @Inject('PERMISSION')
    private permissionEntity: EntityTarget<AbacusPermission>
  ) {}

  index(): Promise<AbacusPermission[]> {
    return getRepository(this.permissionEntity)
      .createQueryBuilder('permission')
      .getMany()
  }
}
