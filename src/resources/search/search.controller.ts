import { Controller, Get, Query } from '@nestjs/common'
import { SearchResult } from '../../interfaces/search-result.interface'
import { SearchService } from './search.service'

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // TODO: Uncomment
  // @Get()
  // async search(
  //   @Query('terms') terms: string,
  //   @Query('resources') resources: string[],
  //   @Query('nonFinishedProjectsOnly') nonFinishedProjectsOnly?: string
  // ): Promise<SearchResult[]> {
  //   return await this.searchService.search({
  //     terms,
  //     resources,
  //     nonFinishedProjectsOnly
  //   })
  // }

  // @Get('/get-search-result-objects')
  // async getSearchResultObjects(
  //   @Query('userIds') userIds?: string[]
  // ): Promise<SearchResult[]> {
  //   return await this.searchService.getSearchResultObjects({
  //     userIds
  //   })
  // }
}
