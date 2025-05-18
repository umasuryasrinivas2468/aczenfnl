import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth, SignIn, SignUp } from "@clerk/clerk-react";
import { useEffect } from "react";
import initializeScheduledTasks from "@/services/scheduledTasks";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProfileSettings from "./pages/ProfileSettings";
import Loans from "./pages/Loans";
import Insurance from "./pages/Insurance";
import Savings from "./pages/Savings";
import Credit from "./pages/Credit";
import History from "./pages/History";
import Hotels from "./pages/Hotels";
import Rewards from "./pages/Rewards";
import Settings from "./pages/Settings";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import PaymentPending from "./pages/PaymentPending";
import Checkout from "./pages/Checkout";
import PaymentStatus from "./pages/PaymentStatus";
import Travel from "./pages/Travel";
import WebView from "./pages/WebView";
import UpiCheckout from "./pages/UpiCheckout";
import ComingSoon from "./pages/ComingSoon";
import { syncAllTransactions } from "@/services/transactionService";

const queryClient = new QueryClient();

// Custom Auth Pages
const ClerkSignIn = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md">
        <SignIn 
          redirectUrl="/" 
          routing="path" 
          path="/sign-in" 
          appearance={{
            elements: {
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
              card: "rounded-xl shadow-md",
              headerTitle: "text-center text-xl font-bold",
              headerSubtitle: "text-center",
            }
          }}
        />
      </div>
    </div>
  );
};

const ClerkSignUp = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md">
        <SignUp 
          redirectUrl="/" 
          routing="path" 
          path="/sign-up" 
          appearance={{
            elements: {
              formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
              card: "rounded-xl shadow-md",
              headerTitle: "text-center text-xl font-bold",
              headerSubtitle: "text-center",
            }
          }}
        />
      </div>
    </div>
  );
};

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();
  
  // Show loading state if auth isn't loaded yet
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p>Loading...</p>
      </div>
    );
  }
  
  // Redirect to sign-in if not signed in
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  // Initialize scheduled tasks when component mounts
  useEffect(() => {
    const tasks = initializeScheduledTasks();
    
    // Trigger an initial transaction sync
    syncAllTransactions().then(({ updated }) => {
      if (updated > 0) {
        console.log(`Initial transaction sync updated ${updated} transactions`);
      }
    }).catch(err => console.error('Initial transaction sync error:', err));
    
    // Clean up on unmount
    return () => {
      tasks.stop();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="bg-black min-h-screen">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth routes */}
              <Route path="/sign-in/*" element={<ClerkSignIn />} />
              <Route path="/sign-up/*" element={<ClerkSignUp />} />
              
              {/* Protected routes */}
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
              <Route path="/loans" element={<ProtectedRoute><Loans /></ProtectedRoute>} />
              <Route path="/insurance" element={<ProtectedRoute><Insurance /></ProtectedRoute>} />
              <Route path="/savings" element={<ProtectedRoute><Savings /></ProtectedRoute>} />
              <Route path="/credit" element={<ProtectedRoute><Credit /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
              <Route path="/hotels" element={<ProtectedRoute><Hotels /></ProtectedRoute>} />
              <Route path="/flights" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
              <Route path="/trains" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
              <Route path="/bus" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
              <Route path="/metro" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><NotFound /></ProtectedRoute>} />
              <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/payment-status" element={<ProtectedRoute><PaymentStatus /></ProtectedRoute>} />
              <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
              <Route path="/payment-failure" element={<ProtectedRoute><PaymentFailure /></ProtectedRoute>} />
              <Route path="/payment-pending" element={<ProtectedRoute><PaymentPending /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/upi-checkout" element={<ProtectedRoute><UpiCheckout /></ProtectedRoute>} />
              
              {/* New routes */}
              <Route path="/travel" element={<ProtectedRoute><Travel /></ProtectedRoute>} />
              <Route path="/webview" element={<ProtectedRoute><WebView /></ProtectedRoute>} />
              <Route path="/coming-soon" element={<ProtectedRoute><ComingSoon /></ProtectedRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
