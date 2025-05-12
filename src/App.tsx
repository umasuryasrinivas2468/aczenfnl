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
import RewardsNew from "./pages/RewardsNew";
import RewardsAdmin from "./pages/RewardsAdmin";
import Settings from "./pages/Settings";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentPage from "./pages/PaymentPage";
import Verification from "./pages/Verification";

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

// Centered auth pages component
const CenteredAuth = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route 
              path="/sign-in/*" 
              element={
                <CenteredAuth>
                  <SignIn routing="path" path="/sign-in" />
                </CenteredAuth>
              } 
            />
            <Route 
              path="/sign-up/*" 
              element={
                <CenteredAuth>
                  <SignUp routing="path" path="/sign-up" />
                </CenteredAuth>
              } 
            />

            {/* Protected routes */}
            <Route path="/verification" element={
              <ProtectedRoute>
                <Verification />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfileSettings />
              </ProtectedRoute>
            } />
            <Route path="/loans" element={
              <ProtectedRoute>
                <Loans />
              </ProtectedRoute>
            } />
            <Route path="/insurance" element={
              <ProtectedRoute>
                <Insurance />
              </ProtectedRoute>
            } />
            <Route path="/savings" element={
              <ProtectedRoute>
                <Savings />
              </ProtectedRoute>
            } />
            <Route path="/credit" element={
              <ProtectedRoute>
                <Credit />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } />
            <Route path="/hotels" element={
              <ProtectedRoute>
                <Hotels />
              </ProtectedRoute>
            } />
            <Route path="/rewards" element={
              <ProtectedRoute>
                <Rewards />
              </ProtectedRoute>
            } />
            <Route path="/rewards/new" element={
              <ProtectedRoute>
                <RewardsNew />
              </ProtectedRoute>
            } />
            <Route path="/rewards/admin" element={
              <ProtectedRoute>
                <RewardsAdmin />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/payment/success" element={
              <ProtectedRoute>
                <PaymentSuccess />
              </ProtectedRoute>
            } />
            <Route path="/payment" element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
