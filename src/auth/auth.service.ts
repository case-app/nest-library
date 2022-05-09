import { HttpException, Injectable, Inject } from '@nestjs/common'
import { Connection, EntityTarget, getRepository } from 'typeorm'

import * as jwt from 'jsonwebtoken'
import * as CryptoJs from 'crypto-js'
import * as Handlebars from 'handlebars'
import * as fs from 'fs'
import { SHA3 } from 'crypto-js'
import * as faker from 'faker'
import { StatusCodes } from 'http-status-codes'

import { EmailService } from '../services/email.service'
import { CaseUser } from '../resources/interfaces/case-user.interface'
import { CasePermission } from '../resources/interfaces/case-permission.interface'

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER') private UserEntity: EntityTarget<CaseUser>,
    private readonly emailService: EmailService,
    private readonly connection: Connection
  ) {}

  async createToken(
    email: string,
    password: string
  ): Promise<{
    accessToken: string
    permissions: string[]
    roleName: string
    userId: number
    homepagePath: string
  }> {
    if (!email) {
      throw new HttpException(
        'Email is required',
        StatusCodes.UNPROCESSABLE_ENTITY
      )
    }
    if (!password) {
      throw new HttpException(
        'Password is required',
        StatusCodes.UNPROCESSABLE_ENTITY
      )
    }
    const user = await getRepository(this.UserEntity).findOne(
      {
        email,
        password: CryptoJs.SHA3(password).toString()
      },
      {
        join: {
          alias: 'user',
          leftJoinAndSelect: {
            role: 'user.role',
            permissions: 'role.permissions'
          }
        }
      }
    )
    if (!user || !user.isActive) {
      throw new HttpException('Invalid credentials', StatusCodes.UNAUTHORIZED)
    }
    if (
      !user.role.permissions.find((p: CasePermission) => p.name === 'canLogin')
    ) {
      throw new HttpException(
        'User not allowed to login',
        StatusCodes.UNAUTHORIZED
      )
    }

    const token = jwt.sign({ email }, process.env.TOKEN_SECRET_KEY)
    return {
      accessToken: token,
      permissions: user.role.permissions.map((p: CasePermission) => p.name),
      roleName: user.role.name,
      homepagePath: user.role.homepagePath,
      userId: user.id
    }
  }

  async getUserFromToken(req): Promise<CaseUser> {
    const token =
      req.headers &&
      req.headers.authorization &&
      req.headers.authorization.replace('Bearer ', '')
    return jwt.verify(
      token,
      process.env.TOKEN_SECRET_KEY,
      async (err, decoded) => {
        if (decoded) {
          const user: any = this.connection
            .getRepository(this.UserEntity)
            .createQueryBuilder('user')
            .where('user.email = :email', { email: decoded.email })
            .leftJoinAndSelect('user.role', 'role')
            .leftJoinAndSelect('role.permissions', 'permission')
            .addSelect('user.lastNotificationCheck')
            .getOne()

          if (!user) {
            throw new HttpException(
              'Cannot find JWT user in database.',
              StatusCodes.FORBIDDEN
            )
          }

          return user
        } else {
          throw new HttpException(
            'Only logged in users can see this content.',
            StatusCodes.FORBIDDEN
          )
        }
      }
    )
  }

  async sendResetPasswordEmail(email: string): Promise<any> {
    const user = await getRepository(this.UserEntity)
      .createQueryBuilder('user')
      .where('email = :email', { email })
      .addSelect('user.token')
      .getOne()

    if (!user) {
      throw new HttpException(
        'This User does not exist in our database',
        StatusCodes.UNAUTHORIZED
      )
    }

    const source = fs.readFileSync(
      'assets/templates/emails/reset-password-email.hbs',
      'utf8'
    )
    const template = Handlebars.compile(source)

    return await this.emailService.send({
      to: user.email,
      subject: `Réinitialisation de votre mot de passe`,
      html: template({
        name: user.name,
        resetLink: `${process.env.FRONT_URL}/reset-password?token=${user.token}`
      })
    })
  }

  hasPermission(user: CaseUser, permission: string): boolean {
    return (
      user.role.permissions &&
      user.role.permissions.length &&
      user.role.permissions.some((p) => p.name === permission)
    )
  }

  async resetPassword(newPassword: string, token: string): Promise<CaseUser> {
    const user = await getRepository(this.UserEntity).findOne({
      token
    })
    if (!user) {
      throw new HttpException(
        'This User does not exist in our database',
        StatusCodes.UNAUTHORIZED
      )
    }
    user.password = SHA3(newPassword).toString()
    // Reset token
    user.token = faker.random.alphaNumeric(20)
    return await getRepository(this.UserEntity).save(user)
  }
}
