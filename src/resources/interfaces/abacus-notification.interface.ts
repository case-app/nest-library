import { AbacusUser } from './abacus-user.interface'

export interface AbacusNotification {
  id: number
  description: string
  linkPath: string
  date: Date
  isHighlighted: boolean

  user: AbacusUser
}
