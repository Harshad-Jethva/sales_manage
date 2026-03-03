import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CursorProvider } from './context/CursorContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

import MainLayout from './components/MainLayout';
import ThreeDCursor from './components/common/ThreeDCursor';
import PageTransition from './components/common/PageTransition';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';

// Lazy load pages for performance optimization (Code Splitting)
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/account/Dashboard'));
const Clients = lazy(() => import('./pages/account/Clients'));
const Bills = lazy(() => import('./pages/account/Bills'));
const Stores = lazy(() => import('./pages/account/Stores'));
const Accounts = lazy(() => import('./pages/account/Accounts'));
const Reports = lazy(() => import('./pages/account/Reports'));


const AddClient = lazy(() => import('./pages/account/clients/AddClient'));
const UpdateClient = lazy(() => import('./pages/account/clients/UpdateClient'));
const DeleteClient = lazy(() => import('./pages/account/clients/DeleteClient'));
const ClientProfile = lazy(() => import('./pages/account/clients/ClientProfile'));

const AddStore = lazy(() => import('./pages/account/stores/AddStore'));
const UpdateStore = lazy(() => import('./pages/account/stores/UpdateStore'));
const DeleteStore = lazy(() => import('./pages/account/stores/DeleteStore'));
const StoreDetails = lazy(() => import('./pages/account/stores/StoreDetails'));

const AddAccount = lazy(() => import('./pages/account/accounts/AddAccount'));
const UpdateAccount = lazy(() => import('./pages/account/accounts/UpdateAccount'));
const DeleteAccount = lazy(() => import('./pages/account/accounts/DeleteAccount'));
const AccountDetails = lazy(() => import('./pages/account/accounts/AccountDetails'));

// Salesman Panel Pages
const SalesmanDashboard = lazy(() => import('./pages/salesman/Dashboard'));
const OrderPlacement = lazy(() => import('./pages/salesman/OrderPlacement'));
const OrderHistory = lazy(() => import('./pages/salesman/OrderHistory'));
const ClientOrderHistory = lazy(() => import('./pages/salesman/ClientOrderHistory'));
const SalesmanProducts = lazy(() => import('./pages/salesman/Products'));
const SalesmanProductDetails = lazy(() => import('./pages/salesman/ProductDetails'));


// Fallback Route Page
const NotFound = lazy(() => import('./pages/NotFound'));

// Global Loader Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px] w-full">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
      <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
    </div>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <CursorProvider>
            <Router>
              <Toaster position="top-right" reverseOrder={false} />
              <ThreeDCursor />
              <Suspense fallback={<PageLoader />}>
                <PageTransition>
                  <Routes>
                    {/* Public Route */}
                    <Route path="/login" element={<Login />} />

                    {/* Protected Routes */}
                    <Route element={<MainLayout />}>


                      {/* Dashboard & Management -- For Admin & Accountant */}
                      <Route element={<ProtectedRoute allowedRoles={['admin', 'accountant']} />}>
                        <Route path="/" element={<Dashboard />} />

                        <Route path="/clients" element={<Clients />} />
                        <Route path="/clients/view" element={<ClientProfile />} />
                        <Route path="/clients/add" element={<AddClient />} />
                        <Route path="/clients/update" element={<UpdateClient />} />
                        <Route path="/clients/delete" element={<DeleteClient />} />

                        <Route path="/bills" element={<Bills />} />

                        <Route path="/stores" element={<Stores />} />
                        <Route path="/stores/add" element={<AddStore />} />
                        <Route path="/stores/update" element={<UpdateStore />} />
                        <Route path="/stores/delete" element={<DeleteStore />} />
                        <Route path="/stores/view" element={<StoreDetails />} />

                        <Route path="/accounts" element={<Accounts />} />
                        <Route path="/accounts/add" element={<AddAccount />} />
                        <Route path="/accounts/update" element={<UpdateAccount />} />
                        <Route path="/accounts/delete" element={<DeleteAccount />} />
                        <Route path="/accounts/view" element={<AccountDetails />} />

                        <Route path="/reports" element={<Reports />} />
                      </Route>



                      {/* Salesman Panel -- Accessible by Admin & Salesman */}
                      <Route element={<ProtectedRoute allowedRoles={['admin', 'salesman']} />}>
                        <Route path="/salesman/dashboard" element={<SalesmanDashboard />} />
                        <Route path="/salesman/place-order" element={<OrderPlacement />} />
                        <Route path="/salesman/order-history" element={<OrderHistory />} />
                        <Route path="/salesman/client-history" element={<ClientOrderHistory />} />
                        <Route path="/salesman/products" element={<SalesmanProducts />} />
                        <Route path="/salesman/products/:id" element={<SalesmanProductDetails />} />
                      </Route>

                    </Route>
                    {/* Fallback Catch-all Route for Unknown Paths */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </PageTransition>
              </Suspense>
            </Router>
          </CursorProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;

