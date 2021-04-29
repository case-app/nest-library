import { Injectable } from '@nestjs/common'

@Injectable()
export class TestService {
  sayHello() {
    return 'HOLA'
  }
}
