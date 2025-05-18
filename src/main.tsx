import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.tsx'
import './index.css'

// Get Clerk publishable key from environment variables
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_aG90LXdlcmV3b2xmLTE4LmNsZXJrLmFjY291bnRzLmRldiQ";

createRoot(document.getElementById("root")!).render(
  <ClerkProvider 
    publishableKey={publishableKey}
    appearance={{
      layout: {
        logoPlacement: "inside",
        showOptionalFields: false,
      },
      variables: {
        colorPrimary: "#3b82f6"
      }
    }}
  >
    <App />
  </ClerkProvider>
)
