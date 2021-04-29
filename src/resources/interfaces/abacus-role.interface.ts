import { AbacusPermission } from './abacus-permission.interface'
import { AbacusUser } from './abacus-user.interface'

export interface AbacusRole {
  id: number
  name: string
  displayName: string
  permissions: AbacusPermission[]
  users: AbacusUser[]
}
