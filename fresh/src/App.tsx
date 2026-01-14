import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Vendors from "./pages/Vendors";
import UsersPage from "./pages/UsersPage";
import Subscriptions from "./pages/Subscriptions";
import Communities from "./pages/Communities";
import Reports from "./pages/Reports";
import OrdersReport from "./pages/OrderReport";
import Categories from "./pages/Categories";
import ServiceOfferings from "./pages/ServiceOfferings";
import PathologyOrderReport from "./pages/PathologyOrderReport";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Marketing from "./pages/Marketing";
import VendorSignup from "./pages/VendorSignup";

const queryClient = new QueryClient();

const App = () => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("accessToken")
  );

  useEffect(() => {
    if (token) localStorage.setItem("accessToken", token);
    else localStorage.removeItem("accessToken");
  }, [token]);

  const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    if (!token) return <Navigate to="/login" replace />;
    return children;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* LOGIN */}
            <Route path="/login" element={<Login setToken={setToken} />} />

            {/* PROTECTED ROUTES */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Products />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendors"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Vendors />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UsersPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscriptions"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Subscriptions />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/communities"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Communities />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Reports />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/order-report"
              element={
                <ProtectedRoute>
                  <Layout>
                    <OrdersReport />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pathology-order-report"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PathologyOrderReport />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Categories />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/service-offerings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ServiceOfferings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="/marketing" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Marketing/>
                </Layout>
              </ProtectedRoute>
            }/>
            
            <Route path="/vendor/signup" 
            element={<VendorSignup />}
             />
     {/*       <Route path="/login"
            element={<Login />} /> */}

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { Layout } from "./components/Layout";
// import Dashboard from "./pages/Dashboard";
// import Products from "./pages/Products";
// import Vendors from "./pages/Vendors";
// import UsersPage from "./pages/UsersPage";
// import Subscriptions from "./pages/Subscriptions";
// import Communities from "./pages/Communities";
// import Reports from "./pages/Reports";
// import NotFound from "./pages/NotFound";
// import OrdersReport from "./pages/OrderReport";
// import Categories from "./pages/Categories";
// import ServiceOfferings from "./pages/ServiceOfferings";
// import PathologyOrderReport from "./pages/PathologyOrderReport";

// const queryClient = new QueryClient();

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider>
//       <Toaster />
//       <Sonner />
//       <BrowserRouter>
//         <Layout>
//           <Routes>
//             <Route path="/" element={<Dashboard />} />
//             <Route path="/products" element={<Products />} />
//             <Route path="/vendors" element={<Vendors />} />
//             <Route path="/users" element={<UsersPage />} />
//             <Route path="/subscriptions" element={<Subscriptions />} />
//             <Route path="/communities" element={<Communities />} />
//             <Route path="/reports" element={<Reports />} />
//             <Route path="/order-report" element={<OrdersReport />} />
//             <Route path="/pathology-order-report" element={<PathologyOrderReport />} />
//             <Route path="/categories" element={<Categories />} />
//             <Route path="/service-offerings" element={<ServiceOfferings />} />
            
//             <Route path="*" element={<NotFound />} />
//           </Routes>
//         </Layout>
//       </BrowserRouter>
//     </TooltipProvider>
//   </QueryClientProvider>
// );

// export default App;
