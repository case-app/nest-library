import { DynamicModule, Global, Module, Provider } from '@nestjs/common'

import { AuthModule } from './auth/auth.module'
import { UploadController } from './files/controllers/upload.controller'
import { DocXService } from './files/services/doc-x.service'
import { ExcelService } from './files/services/excel.service'
import { FileService } from './files/services/file.service'
import { ImageService } from './files/services/image.service'
import { PdfService } from './files/services/pdf.service'
import { CaseOptions } from './interfaces/case-options.interface'
import { NotificationModule } from './resources/notification/notification.module'
import { PermissionModule } from './resources/permission/permission.module'
import { RoleModule } from './resources/role/role.module'
import { BugsnagLoggerService } from './services/bugsnag-logger.service'
import { EmailService } from './services/email.service'
import { HelperService } from './services/helper.service'
import { PaginationService } from './services/pagination.service'

@Global()
@Module({
  imports: [AuthModule]
})
export class CaseNestLibraryModule {
  static forRoot(options: CaseOptions): DynamicModule {
    const providers: Provider[] = [
      ExcelService,
      DocXService,
      ExcelService,
      PdfService,
      HelperService,
      PaginationService,
      FileService,
      ImageService,
      EmailService,
      BugsnagLoggerService,
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
      },
      {
        provide: 'CONNECTION_OPTIONS',
        useValue: options.connectionOptions
      },
      {
        provide: 'REFLECTOR',
        useValue: options.reflector
      }
    ]

    return {
      module: CaseNestLibraryModule,
      imports: [NotificationModule, RoleModule, PermissionModule],
      providers: providers,
      exports: providers,
      controllers: [UploadController]
    }
  }
}
