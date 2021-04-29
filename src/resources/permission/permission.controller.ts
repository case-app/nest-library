import { Controller, Get } from '@nestjs/common'
import { AbacusPermission } from '../interfaces/abacus-permission.interface'
import { PermissionService } from './permission.service'

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  async index(): Promise<AbacusPermission[]> {
    return this.permissionService.index()
  }
}
