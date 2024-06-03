'use client'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export const Toast = () => (
  <ToastContainer
    position='top-right'
    autoClose={8000}
    hideProgressBar={false}
    newestOnTop={false}
    draggable={false}
    closeOnClick
    pauseOnHover
  />
)
