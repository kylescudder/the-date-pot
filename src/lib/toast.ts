import { toast } from 'sonner'

export const successToast = (name: string) => toast(`${name} updated! 🥳`)
export const archiveToast = (name: string) => toast(`${name} archived 📦`)
export const deleteToast = (name: string) => toast(`${name} deleted 🗑️`)
