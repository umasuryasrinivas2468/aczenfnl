import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

// Import Clerk publishable key from environment variables
const clerkPubKey = "pk_test_aW50aW1hdGUtbGVtbWluZy05My5jbGVyay5hY2NvdW50cy5kZXYk"

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={clerkPubKey}>
    <App />
  </ClerkProvider>
)
