import { AbacusRole } from './abacus-role.interface'

export interface AbacusUser {
  id: number
  name: string
  email: string
  password: string
  token: string
  isActive: boolean
  lastNotificationCheck: Date
  role: AbacusRole
}
