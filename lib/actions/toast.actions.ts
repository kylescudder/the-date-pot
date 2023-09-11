'use client'

import { toast } from 'react-toastify'
import { IVinyl } from '../models/vinyl'

export const successToast = async (vinylItem: IVinyl) => {
	toast.success(`${vinylItem.name} updated! 🥳`, {
    position: "top-right",
    autoClose: 2500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
  });
}

export const archiveToast = async (name: string) => {
  toast.error(`${name} archived 📦`, {
    position: "top-right",
    autoClose: 1000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
  });
};
