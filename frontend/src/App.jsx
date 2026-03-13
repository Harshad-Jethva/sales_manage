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
const RouteCalendar = lazy(() => import('./pages/salesman/RouteCalendar'));
const RouteNavigation = lazy(() => import('./pages/salesman/RouteNavigation'));

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
const EmployeeManagement = lazy(() => import('./pages/admin/EmployeeManagement'));
const ClientManagement = lazy(() => import('./pages/admin/ClientManagement'));
const VendorManagement = lazy(() => import('./pages/admin/VendorManagement'));
const ClientAccountManagement = lazy(() => import('./pages/admin/ClientAccountManagement'));
const PanelLoginRedirect = lazy(() => import('./pages/admin/PanelLoginRedirect'));
const StockDetails = lazy(() => import('./pages/admin/StockDetails'));
const StockReports = lazy(() => import('./pages/admin/StockReports'));
const ExpiryManagement = lazy(() => import('./pages/admin/ExpiryManagement'));
const ExpiryReports = lazy(() => import('./pages/admin/ExpiryReports'));
const RoutePlanner = lazy(() => import('./pages/admin/RoutePlanner'));
const RouteHistory = lazy(() => import('./pages/admin/RouteHistory'));
const LiveTracking = lazy(() => import('./pages/admin/LiveTracking'));
const TrackingReports = lazy(() => import('./pages/admin/TrackingReports'));

// Delivery System Pages (Warehouse Panel additions)
const DeliveryStaff = lazy(() => import('./pages/warehouse/delivery/DeliveryStaff'));
const DeliveryOrders = lazy(() => import('./pages/warehouse/delivery/DeliveryOrders'));
const DeliveryTracking = lazy(() => import('./pages/warehouse/delivery/DeliveryTracking'));
const DeliveryDashboard = lazy(() => import('./pages/warehouse/delivery/DeliveryDashboard'));
const DeliveryReports = lazy(() => import('./pages/warehouse/delivery/DeliveryReports'));

// Transport & Builty Pages
const TransportManagement = lazy(() => import('./pages/warehouse/TransportManagement'));
const TransportRecords = lazy(() => import('./pages/warehouse/TransportRecords'));
const TransportReports = lazy(() => import('./pages/warehouse/TransportReports'));

// Delivery Personnel Panel Pages
const DeliveryPanelDashboard = lazy(() => import('./pages/delivery/Dashboard'));
const MyDeliveries = lazy(() => import('./pages/delivery/MyDeliveries'));


// Notification System
const NotificationCenter = lazy(() => import('./components/admin/notifications/NotificationCenter'));
const NotificationResponseHistory = lazy(() => import('./components/admin/notifications/NotificationResponseHistory'));

// Overdue Management System
const OverdueCollections = lazy(() => import('./components/admin/overdue/OverdueCollections'));
const CollectionHistory = lazy(() => import('./components/admin/overdue/CollectionHistory'));

// Cash Handover Pages
const CashHandover = lazy(() => import('./pages/common/CashHandover'));
const CashHistory = lazy(() => import('./pages/admin/CashHistory'));

// Attendance & HR Pages
const AttendanceDashboard = lazy(() => import('./pages/admin/attendance/Dashboard'));
const AttendanceManage = lazy(() => import('./pages/admin/attendance/Manage'));
const AttendanceReports = lazy(() => import('./pages/admin/attendance/Reports'));
const SalarySettings = lazy(() => import('./pages/admin/attendance/SalarySettings'));
const HolidaySettings = lazy(() => import('./pages/admin/attendance/Holidays'));
const SalaryReport = lazy(() => import('./pages/admin/attendance/SalaryReport'));

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
                          <Route path="/pos/bills" element={<POSAllBills />} />
                          <Route path="/pos/analytics" element={<POSReport />} />
                          <Route path="/pos/client-profile" element={<ClientProfile />} />
                          <Route path="/pos/cash-handover" element={<CashHandover panelName="POS" />} />
                        </Route>

                        {/* Dashboard & Management -- For Admin & Accountant */}
                        <Route element={<ProtectedRoute allowedRoles={['admin', 'accountant', 'client_panel', 'vendor_user', 'salesman_user']} />}>
                          <Route path="/" element={<Dashboard />} />
                          <Route path="/clients" element={<Clients />} />
                          <Route path="/clients/view" element={<ClientProfile />} />
                          <Route path="/clients/add" element={<AddClient />} />
                          <Route path="/clients/update" element={<UpdateClient />} />
                          <Route path="/clients/delete" element={<DeleteClient />} />
                          <Route path="/inventory-management" element={<Bills />} />
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
                          <Route path="/accounts/cash-handover" element={<CashHandover panelName="Accounts" />} />
                        </Route>

                        {/* Salesman Panel -- Accessible by Admin & Salesman */}
                        <Route element={<ProtectedRoute allowedRoles={['admin', 'salesman']} />}>
                          <Route path="/salesman/dashboard" element={<SalesmanDashboard />} />
                          <Route path="/salesman/place-order" element={<OrderPlacement />} />
                          <Route path="/salesman/order-history" element={<OrderHistory />} />
                          <Route path="/salesman/client-history" element={<ClientOrderHistory />} />
                          <Route path="/salesman/catalog" element={<SalesmanProducts />} />
                          <Route path="/salesman/catalog/:id" element={<SalesmanProductDetails />} />
                          <Route path="/salesman/route-calendar" element={<RouteCalendar />} />
                          <Route path="/salesman/route-navigation" element={<RouteNavigation />} />
                          <Route path="/salesman/cash-handover" element={<CashHandover panelName="Salesman" />} />
                        </Route>

                        {/* Warehouse Panel -- Accessible by Admin & Warehouse */}
                        <Route element={<ProtectedRoute allowedRoles={['admin', 'warehouse']} />}>
                          <Route path="/warehouse/dashboard" element={<WarehouseDashboard />} />
                          <Route path="/warehouse/receive-order" element={<ReceiveOrder />} />
                          <Route path="/warehouse/stock" element={<StockDetails />} />
                          <Route path="/warehouse/reports" element={<Reports />} />
                          <Route path="/warehouse/route-planner" element={<RoutePlanner />} />
                          <Route path="/warehouse/route_planner" element={<RoutePlanner />} />
                          <Route path="/warehouse/route-history" element={<RouteHistory />} />
                          <Route path="/warehouse/route_history" element={<RouteHistory />} />
                          <Route path="/warehouse/live-tracking" element={<LiveTracking />} />
                          <Route path="/warehouse/cash-handover" element={<CashHandover panelName="Warehouse" />} />

                          {/* Delivery System Routes attached to Warehouse */}
                          <Route path="/warehouse/delivery-staff" element={<DeliveryStaff />} />
                          <Route path="/warehouse/delivery-orders" element={<DeliveryOrders />} />
                          <Route path="/warehouse/delivery-tracking" element={<DeliveryTracking />} />
                          <Route path="/warehouse/delivery-dashboard" element={<DeliveryDashboard />} />
                          <Route path="/warehouse/delivery-reports" element={<DeliveryReports />} />

                          {/* Transport & Builty Routes */}
                          <Route path="/warehouse/transport-management" element={<TransportManagement />} />
                          <Route path="/warehouse/transport-records" element={<TransportRecords />} />
                          <Route path="/warehouse/transport-reports" element={<TransportReports />} />
                        </Route>

                        {/* Delivery Support Panel -- Accessible by Admin & Delivery Person */}
                        <Route element={<ProtectedRoute allowedRoles={['admin', 'delivery']} />}>
                          <Route path="/delivery/dashboard" element={<DeliveryPanelDashboard />} />
                          <Route path="/delivery/my-deliveries" element={<MyDeliveries />} />
                          <Route path="/delivery/my deliveries" element={<MyDeliveries />} />
                        </Route>

                        {/* Admin Appended Route */}
                        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                          <Route path="/admin/dashboard" element={<AdminDashboard />} />
                          <Route path="/admin/access-control" element={<AdminAccessControl />} />
                          <Route path="/admin/employees" element={<EmployeeManagement />} />
                          <Route path="/admin/clients" element={<ClientManagement />} />
                          <Route path="/admin/vendors" element={<VendorManagement />} />
                          <Route path="/admin/client-accounts" element={<ClientAccountManagement />} />
                          <Route path="/admin/notifications" element={<NotificationCenter />} />
                          <Route path="/admin/notification-responses" element={<NotificationResponseHistory />} />
                          <Route path="/admin/overdue-collections" element={<OverdueCollections />} />
                          <Route path="/admin/collection-history" element={<CollectionHistory />} />
                          <Route path="/admin/stock-details" element={<StockDetails />} />
                          <Route path="/admin/stock-reports" element={<StockReports />} />
                          <Route path="/admin/expiry-management" element={<ExpiryManagement />} />
                          <Route path="/admin/expiry-reports" element={<ExpiryReports />} />
                          <Route path="/admin/route-planner" element={<RoutePlanner />} />
                          <Route path="/admin/route_planner" element={<RoutePlanner />} />
                          <Route path="/admin/route-history" element={<RouteHistory />} />
                          <Route path="/admin/route_history" element={<RouteHistory />} />
                          <Route path="/salesman-tracking" element={<LiveTracking />} />
                          <Route path="/admin/tracking-reports" element={<TrackingReports />} />
                          <Route path="/admin/cash-handover" element={<CashHandover panelName="Admin" />} />
                          <Route path="/admin/cash-history" element={<CashHistory />} />

                          {/* Attendance & HR Routes */}
                          <Route path="/admin/attendance/dashboard" element={<AttendanceDashboard />} />
                          <Route path="/admin/attendance/manage" element={<AttendanceManage />} />
                          <Route path="/admin/attendance/reports" element={<AttendanceReports />} />
                          <Route path="/admin/attendance/salary-settings" element={<SalarySettings />} />
                          <Route path="/admin/attendance/holidays" element={<HolidaySettings />} />
                          <Route path="/admin/attendance/salary-report" element={<SalaryReport />} />

                          {/* Delivery System Routes mirrored in Admin Panel for full access */}
                          <Route path="/admin/delivery-staff" element={<DeliveryStaff />} />
                          <Route path="/admin/delivery-orders" element={<DeliveryOrders />} />
                          <Route path="/admin/delivery-tracking" element={<DeliveryTracking />} />
                          <Route path="/admin/delivery-dashboard" element={<DeliveryDashboard />} />
                          <Route path="/admin/delivery-reports" element={<DeliveryReports />} />
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
