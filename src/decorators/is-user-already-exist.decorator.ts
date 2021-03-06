import { Inject, Injectable } from '@nestjs/common'
import {
  ValidatorConstraint,
  ValidatorConstraintInterface
} from 'class-validator'
import { EntityTarget, getConnection } from 'typeorm'

import { CaseUser } from '../resources/interfaces/case-user.interface'

@ValidatorConstraint({ name: 'isUserAlreadyExist', async: true })
@Injectable()
export class IsUserAlreadyExist implements ValidatorConstraintInterface {
  constructor(@Inject('USER') private UserEntity: EntityTarget<CaseUser>) {}

  async validate(text: string): Promise<boolean> {
    const user: CaseUser = await getConnection()
      .getRepository(this.UserEntity)
      .createQueryBuilder('user')
      .where('user.email = :email', { email: text })
      .getOne()

    return !user
  }

  defaultMessage() {
    return 'Erreur : Un utilisateur avec le même e-mail est déjà présent en base de données.'
  }
}
