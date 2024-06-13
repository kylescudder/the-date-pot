import { User } from '@/server/db/schema'

export interface Users extends User {
  image: string
}
