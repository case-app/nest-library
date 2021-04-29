import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards
} from '@nestjs/common'
import { RoleService } from './role.service'

import { CreateUpdateRoleDto } from './dtos/create-update-role.dto'
import { DeleteResult, UpdateResult } from 'typeorm'
import { Permission } from '../../decorators/permission.decorator'
import { Paginator } from '../../interfaces/paginator.interface'
import { AbacusRole } from '../interfaces/abacus-role.interface'
import { AuthGuard } from '../../guards/auth.guard'
import { SelectOption } from '../../interfaces/select-option.interface'

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}
  @Get()
  @Permission('browseRoles')
  async index(
    @Query('page') page: string,
    @Query('withoutPagination') withoutPagination: string
  ): Promise<Paginator<AbacusRole> | AbacusRole[]> {
    return this.roleService.index({
      page,
      withoutPagination
    })
  }

  @Get('select-options')
  @UseGuards(AuthGuard)
  async listSelectOptions(): Promise<SelectOption[]> {
    const roles: AbacusRole[] = (await this.roleService.index({
      withoutPagination: 'true'
    })) as AbacusRole[]

    return roles.map((r: AbacusRole) => ({
      label: r.displayName,
      value: r.id.toString()
    }))
  }

  @Get('/:id')
  @Permission('readRoles')
  async show(@Param('id') id: string): Promise<AbacusRole> {
    return this.roleService.show(id)
  }

  @Post()
  @Permission('addRoles')
  async store(@Body() roleDto: CreateUpdateRoleDto): Promise<AbacusRole> {
    return await this.roleService.store(roleDto)
  }

  @Put('/:id')
  @Permission('editRoles')
  async update(
    @Param('id') id: string,
    @Body() roleDto: CreateUpdateRoleDto
  ): Promise<UpdateResult> {
    return await this.roleService.update(id, roleDto)
  }

  @Delete('/:id')
  @Permission('deleteRoles')
  async delete(@Param() id: string): Promise<DeleteResult> {
    return await this.roleService.destroy(id)
  }
}
