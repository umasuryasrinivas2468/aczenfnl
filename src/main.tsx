import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

// Import Clerk publishable key from environment variables
const clerkPubKey = "pk_test_aG90LXdlcmV3b2xmLTE4LmNsZXJrLmFjY291bnRzLmRldiQ"

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={clerkPubKey}>
    <App />
  </ClerkProvider>
)
