'use client'

import { toast } from 'sonner'

export const successToast = async (name: string) => {
  toast(`${name} updated! 🥳`)
}

export const archiveToast = async (name: string) => {
  toast(`${name} archived 📦`)
}

export const deleteToast = async (name: string) => {
  toast(`${name} deleted 🗑️`)
}
