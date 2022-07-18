import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  Connection,
  DataSource,
  DeleteResult,
  EntityTarget,
  UpdateResult
} from 'typeorm'
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions'

import { Paginator } from '../../interfaces/paginator.interface'
import { PaginationService } from '../../services/pagination.service'
import { CasePermission } from '../interfaces/case-permission.interface'
import { CaseRole } from '../interfaces/case-role.interface'
import { CreateUpdateRoleDto } from './dtos/create-update-role.dto'

@Injectable()
export class RoleService {
  connection: Connection

  constructor(
    @Inject('ROLE')
    private roleEntity: EntityTarget<CaseRole>,
    @Inject('PERMISSION')
    private permissionEntity: EntityTarget<CasePermission>,
    private readonly paginationService: PaginationService,
    @Inject('CONNECTION_OPTIONS')
    private connectionOptions: MysqlConnectionOptions
  ) {
    this.connection = new DataSource(this.connectionOptions)
  }

  async index({
    page,
    withoutPagination
  }: {
    page?: string
    withoutPagination?: string
  }): Promise<Paginator<CaseRole> | CaseRole[]> {
    const query = this.connection
      .getRepository(this.roleEntity)
      .createQueryBuilder('role')
      .loadRelationCountAndMap('role.childRelationCount', 'role.users')
      .orderBy('role.name', 'ASC')

    if (withoutPagination === 'true') {
      return query.getMany()
    }

    return this.paginationService.paginate({
      query,
      resultsPerPage: 40,
      currentPage: page ? parseInt(page, 10) : 1
    })
  }

  async show(id: number): Promise<CaseRole> {
    const role = await this.connection
      .getRepository(this.roleEntity)
      .createQueryBuilder('role')
      .where('role.id = :id', { id })
      .loadRelationCountAndMap('role.childRelationCount', 'role.users')
      .leftJoinAndSelect('role.permissions', 'permission')
      .getOne()

    if (!role) {
      throw new NotFoundException()
    }

    return role
  }

  async store(roleDto: CreateUpdateRoleDto): Promise<CaseRole> {
    const role: CaseRole = await this.connection
      .getRepository(this.roleEntity)
      .create(roleDto)

    if (roleDto.permissionIds && roleDto.permissionIds.length) {
      const permissions: CasePermission[] = await this.connection
        .getRepository(this.permissionEntity)
        .findByIds(roleDto.permissionIds)

      role.permissions = permissions
    }

    return this.connection.getRepository(this.roleEntity).save(role)
  }

  async update(
    id: number,
    roleDto: CreateUpdateRoleDto
  ): Promise<UpdateResult> {
    const oldRole: CaseRole = await this.connection
      .getRepository(this.roleEntity)
      .findOneOrFail({
        where: {
          id: id
        },
        relations: {
          permissions: true
        }
      })

    const role: CaseRole = await this.connection
      .getRepository(this.roleEntity)
      .create(roleDto)

    // Update relationships : Permissions
    await this.connection
      .createQueryBuilder()
      .relation(this.roleEntity, 'permissions')
      .of(id)
      .remove(oldRole.permissions.map((p: CasePermission) => p.id))

    if (roleDto.permissionIds && roleDto.permissionIds.length) {
      await this.connection
        .createQueryBuilder()
        .relation(this.roleEntity, 'permissions')
        .of(id)
        .add(roleDto.permissionIds)
    }

    return this.connection.getRepository(this.roleEntity).update(id, role)
  }

  async destroy(id: number): Promise<DeleteResult> {
    const role: CaseRole = await this.connection
      .getRepository(this.roleEntity)
      .findOneByOrFail({ id })

    return this.connection.getRepository(this.roleEntity).delete(role.id)
  }
}
