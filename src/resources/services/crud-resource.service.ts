import { Injectable, NotFoundException } from '@nestjs/common'
import { DeleteResult, Repository, UpdateResult } from 'typeorm'
import { Paginator } from '../../interfaces/paginator.interface'
import { PaginationService } from '../../services/pagination.service'

// ! We should find a way to get resource types from child service.
interface MyResource {
  [key: string]: any
}
interface CreateUpdateMyResourceDto {
  [key: string]: any
}

// Basic CRUD service for resources.
@Injectable()
export class CrudResourceService {
  private repository: Repository<MyResource>

  constructor(private paginationService: PaginationService) {}

  async index({
    page,
    orderBy,
    orderByDesc,
    withoutPagination
  }: {
    page?: string
    orderBy?: string
    orderByDesc?: string
    withoutPagination?: string
  }): Promise<Paginator<MyResource> | MyResource[]> {
    const query = this.repository.createQueryBuilder('myResource')

    if (orderBy) {
      query.orderBy(
        orderBy.includes('.') ? orderBy : 'myResource.' + orderBy,
        orderByDesc && orderByDesc === 'true' ? 'DESC' : 'ASC'
      )
    }
    if (withoutPagination === 'true') {
      return await query.getMany()
    }

    return await this.paginationService.paginate({
      query,
      currentPage: page ? parseInt(page, 10) : 1
    })
  }

  async show(id: string): Promise<MyResource> {
    const myResource: MyResource = await this.repository
      .createQueryBuilder('myResource')
      .where('myResource.id = :id', {
        id
      })
      .getOne()

    if (!myResource) {
      throw new NotFoundException()
    }

    return myResource
  }

  async store(myResourceDto: CreateUpdateMyResourceDto): Promise<MyResource> {
    const myResource: MyResource = this.repository.create(myResourceDto)
    return await this.repository.save(myResource)
  }

  async update(
    id: string,
    myResourceDto: CreateUpdateMyResourceDto
  ): Promise<UpdateResult> {
    const myResource: MyResource = this.repository.create(myResourceDto)

    return await this.repository.update(id, myResource)
  }

  async destroy(id: string): Promise<DeleteResult> {
    const myResource: MyResource = await this.repository.findOne(id)
    if (!myResource) {
      throw new NotFoundException()
    }
    return await this.repository.delete(myResource.id)
  }
}
