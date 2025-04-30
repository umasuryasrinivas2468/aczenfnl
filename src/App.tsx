import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth, SignIn, SignUp } from "@clerk/clerk-react";
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

const queryClient = new QueryClient();

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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="bg-black min-h-screen">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Auth routes */}
              <Route path="/sign-in/*" element={<SignIn redirectUrl="/" routing="path" path="/sign-in" />} />
              <Route path="/sign-up/*" element={<SignUp redirectUrl="/" routing="path" path="/sign-up" />} />
              
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
              <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
