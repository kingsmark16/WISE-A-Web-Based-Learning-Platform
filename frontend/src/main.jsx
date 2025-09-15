import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react'
import {BrowserRouter} from 'react-router-dom'
import {QueryClient, QueryClientProvider} from '@tanstack/react-query'
import AuthProvider from './provider/AuthProvider.jsx'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY}
        signInUrl='/sign-in'
        signUpUrl='/sign-in'
      >
        <QueryClientProvider client={queryClient}>
         <ReactQueryDevtools initialIsOpen={false} />
            <AuthProvider>
              <App />
            </AuthProvider>
          
        </QueryClientProvider>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>
)
