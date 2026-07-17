import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import DialogProvider from './components/DialogProvider'
import App from './App.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
        <ToastContainer
          position="bottom-right"
          autoClose={3500}
          hideProgressBar
          closeButton={false}
          toastClassName="hz-toast"
        />
        <DialogProvider />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
)
