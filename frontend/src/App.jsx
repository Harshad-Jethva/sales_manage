import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CursorProvider } from './context/CursorContext';
import { ThemeProvider } from './context/ThemeContext';
import { FloatingWindowProvider } from './context/FloatingWindowContext';
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

// Cashier Panel Pages
const POS = lazy(() => import('./pages/cashier/POS'));
const POSClientBills = lazy(() => import('./pages/cashier/ClientBills'));
const POSAllBills = lazy(() => import('./pages/cashier/AllBills'));
const POSReport = lazy(() => import('./pages/cashier/Report'));

// Warehouse Panel Pages
const WarehouseDashboard = lazy(() => import('./pages/warehouse/WarehouseDashboard'));
const ReceiveOrder = lazy(() => import('./pages/warehouse/ReceiveOrder'));

// Admin Panel Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminAccessControl = lazy(() => import('./pages/admin/AdminAccessControl'));
const PanelLoginRedirect = lazy(() => import('./pages/admin/PanelLoginRedirect'));

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
          <FloatingWindowProvider>
            <CursorProvider>
              <Router>
                <Toaster position="top-right" reverseOrder={false} />
                <ThreeDCursor />
                <Suspense fallback={<PageLoader />}>
                  <PageTransition>
                    <Routes>
                      {/* Public Route */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/admin/panel-login" element={<PanelLoginRedirect />} />

                      {/* Protected Routes */}
                      <Route element={<MainLayout />}>
                        {/* Standalone Cashier POS Route */}
                        <Route element={<ProtectedRoute allowedRoles={['admin', 'cashier', 'warehouse']} />}>
                          <Route path="/pos" element={<POS />} />
                          <Route path="/pos/clients" element={<POSClientBills />} />
                          <Route path="/pos/all-bills" element={<POSAllBills />} />
                          <Route path="/pos/report" element={<POSReport />} />
                          <Route path="/pos/client-profile" element={<ClientProfile />} />
                        </Route>

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

                        {/* Warehouse Panel -- Accessible by Admin & Warehouse */}
                        <Route element={<ProtectedRoute allowedRoles={['admin', 'warehouse']} />}>
                          <Route path="/warehouse/dashboard" element={<WarehouseDashboard />} />
                          <Route path="/warehouse/receive-order" element={<ReceiveOrder />} />
                          <Route path="/warehouse/inventory" element={<Dashboard />} />
                          <Route path="/warehouse/reports" element={<Reports />} />
                        </Route>

                        {/* Admin Appended Route */}
                        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                          <Route path="/admin/dashboard" element={<AdminDashboard />} />
                          <Route path="/admin/access-control" element={<AdminAccessControl />} />
                        </Route>
                      </Route>

                      {/* Fallback Catch-all Route for Unknown Paths */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </PageTransition>
                </Suspense>
              </Router>
            </CursorProvider>
          </FloatingWindowProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
