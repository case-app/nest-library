import { AbacusRole } from './abacus-role.interface'

export interface AbacusPermission {
  id: number
  name: string
  roles: AbacusRole[]
}
