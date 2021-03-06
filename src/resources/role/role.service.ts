import { Inject, Injectable, NotFoundException } from '@nestjs/common'
import {
  DeleteResult,
  EntityTarget,
  getConnection,
  getRepository,
  UpdateResult
} from 'typeorm'

import { Paginator } from '../../interfaces/paginator.interface'
import { PaginationService } from '../../services/pagination.service'
import { CasePermission } from '../interfaces/case-permission.interface'
import { CaseRole } from '../interfaces/case-role.interface'
import { CreateUpdateRoleDto } from './dtos/create-update-role.dto'

@Injectable()
export class RoleService {
  constructor(
    @Inject('ROLE')
    private roleEntity: EntityTarget<CaseRole>,
    @Inject('PERMISSION')
    private permissionEntity: EntityTarget<CasePermission>,
    private readonly paginationService: PaginationService
  ) {}

  async index({
    page,
    withoutPagination
  }: {
    page?: string
    withoutPagination?: string
  }): Promise<Paginator<CaseRole> | CaseRole[]> {
    const query = getRepository(this.roleEntity)
      .createQueryBuilder('role')
      .loadRelationCountAndMap('role.childRelationCount', 'role.users')
      .orderBy('role.name', 'ASC')

    if (withoutPagination === 'true') {
      return await query.getMany()
    }

    return await this.paginationService.paginate({
      query,
      resultsPerPage: 40,
      currentPage: page ? parseInt(page, 10) : 1
    })
  }

  async show(id: string): Promise<CaseRole> {
    const role = await getRepository(this.roleEntity)
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
    const role: CaseRole = await getRepository(this.roleEntity).create(roleDto)

    if (roleDto.permissionIds && roleDto.permissionIds.length) {
      const permissions: CasePermission[] = await await getRepository(
        this.permissionEntity
      ).findByIds(roleDto.permissionIds)

      role.permissions = permissions
    }

    return await await getRepository(this.roleEntity).save(role)
  }

  async update(
    id: string,
    roleDto: CreateUpdateRoleDto
  ): Promise<UpdateResult> {
    const oldRole: CaseRole = await await getRepository(
      this.roleEntity
    ).findOne(id, {
      relations: ['permissions']
    })

    const role: CaseRole = await getRepository(this.roleEntity).create(roleDto)

    // Update relationships : Permissions
    await getConnection()
      .createQueryBuilder()
      .relation(this.roleEntity, 'permissions')
      .of(id)
      .remove(oldRole.permissions.map((p: CasePermission) => p.id))

    if (roleDto.permissionIds && roleDto.permissionIds.length) {
      await getConnection()
        .createQueryBuilder()
        .relation(this.roleEntity, 'permissions')
        .of(id)
        .add(roleDto.permissionIds)
    }

    return await await getRepository(this.roleEntity).update(id, role)
  }

  async destroy(id: string): Promise<DeleteResult> {
    const role: CaseRole = await await getRepository(this.roleEntity).findOne(
      id
    )
    if (!role) {
      throw new NotFoundException()
    }
    return await await getRepository(this.roleEntity).delete(role.id)
  }
}
