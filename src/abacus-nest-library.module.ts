import { DynamicModule, Global, Module, Provider } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthController } from './auth/auth.controller'
import { AuthService } from './auth/auth.service'
import { UploadController } from './files/controllers/upload.controller'
import { DocXService } from './files/services/doc-x.service'
import { ExcelService } from './files/services/excel.service'
import { FileService } from './files/services/file.service'
import { ImageService } from './files/services/image.service'
import { PdfService } from './files/services/pdf.service'
import { AbacusOptions } from './interfaces/abacus-options.interface'
import { NotificationModule } from './resources/notification/notification.module'
import { PermissionModule } from './resources/permission/permission.module'
import { RoleModule } from './resources/role/role.module'
import { SearchController } from './resources/search/search.controller'
import { SearchService } from './resources/search/search.service'
import { BugsnagLoggerService } from './services/bugsnag-logger.service'
import { EmailService } from './services/email.service'
import { HelperService } from './services/helper.service'
import { PaginationService } from './services/pagination.service'
import { TestService } from './test.service'
import { CrudResourceService } from './resources/services/crud-resource.service'

@Global()
@Module({})
export class AbacusNestLibraryModule {
  static forRoot(options: AbacusOptions): DynamicModule {
    const providers: Provider[] = [
      AuthService,
      TestService,
      ExcelService,
      DocXService,
      ExcelService,
      PdfService,
      HelperService,
      PaginationService,
      FileService,
      ImageService,
      EmailService,
      SearchService,
      BugsnagLoggerService,
      CrudResourceService,
      {
        provide: 'USER',
        useValue: options.userEntity
      },
      {
        provide: 'NOTIFICATION',
        useValue: options.notificationEntity
      },
      {
        provide: 'PERMISSION',
        useValue: options.permissionEntity
      },
      {
        provide: 'ROLE',
        useValue: options.roleEntity
      }
    ]

    return {
      module: AbacusNestLibraryModule,
      imports: [
        TypeOrmModule.forRoot(options.connectionOptions),
        NotificationModule,
        RoleModule,
        PermissionModule
      ],
      providers: providers,
      exports: providers,
      controllers: [UploadController, AuthController, SearchController]
    }
  }
}
