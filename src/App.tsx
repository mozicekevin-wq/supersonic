import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import AdminGuard from '@/components/common/AdminGuard';
import PublicLayout from '@/components/layout/PublicLayout';
import AdminLayout from '@/components/layout/AdminLayout';

// ── Public pages ─────────────────────────────────────────────────────────────
const HomePage           = lazy(() => import('@/pages/HomePage'));
const ProductsPage       = lazy(() => import('@/pages/ProductsPage'));
const ProductDetailPage  = lazy(() => import('@/pages/ProductDetailPage'));
const PromotionsPage     = lazy(() => import('@/pages/PromotionsPage'));
const PublicationsPage   = lazy(() => import('@/pages/PublicationsPage'));
const StoresPage         = lazy(() => import('@/pages/StoresPage'));
const ContactPage        = lazy(() => import('@/pages/ContactPage'));
const NotFound           = lazy(() => import('@/pages/NotFound'));

// ── Admin pages ──────────────────────────────────────────────────────────────
const AdminLoginPage     = lazy(() => import('@/pages/admin/AdminLoginPage'));
const AdminDashboard     = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminProductsPage  = lazy(() => import('@/pages/admin/AdminProductsPage'));
const AdminCategoriesPage = lazy(() => import('@/pages/admin/AdminCategoriesPage'));
const AdminPublicationsPage = lazy(() => import('@/pages/admin/AdminPublicationsPage'));
const AdminPromotionsPage = lazy(() => import('@/pages/admin/AdminPromotionsPage'));
const AdminOrdersPage    = lazy(() => import('@/pages/admin/AdminOrdersPage'));
const AdminUsersPage     = lazy(() => import('@/pages/admin/AdminUsersPage'));
const AdminStoresPage    = lazy(() => import('@/pages/admin/AdminStoresPage'));
const AdminSettingsPage  = lazy(() => import('@/pages/admin/AdminSettingsPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <IntersectObserver />
        <Routes>
          {/* ── Public site wrapped in PublicLayout ── */}
          <Route element={<S><PublicLayout /></S>}>
            <Route path="/"               element={<S><HomePage /></S>} />
            <Route path="/products"       element={<S><ProductsPage /></S>} />
            <Route path="/products/:slug" element={<S><ProductDetailPage /></S>} />
            <Route path="/promotions"     element={<S><PromotionsPage /></S>} />
            <Route path="/publications"   element={<S><PublicationsPage /></S>} />
            <Route path="/publications/:id" element={<S><PublicationsPage /></S>} />
            <Route path="/stores"         element={<S><StoresPage /></S>} />
            <Route path="/contact"        element={<S><ContactPage /></S>} />
          </Route>

          {/* ── Admin login (standalone, no layout) ── */}
          <Route path="/admin/login" element={<S><AdminLoginPage /></S>} />

          {/* ── Admin area — protected + AdminLayout ── */}
          <Route path="/admin" element={
            <AdminGuard>
              <S><AdminLayout /></S>
            </AdminGuard>
          }>
            <Route index               element={<S><AdminDashboard /></S>} />
            <Route path="products"     element={<S><AdminProductsPage /></S>} />
            <Route path="categories"   element={<S><AdminCategoriesPage /></S>} />
            <Route path="publications" element={<S><AdminPublicationsPage /></S>} />
            <Route path="promotions"   element={<S><AdminPromotionsPage /></S>} />
            <Route path="orders"       element={<S><AdminOrdersPage /></S>} />
            <Route path="users"        element={<S><AdminUsersPage /></S>} />
            <Route path="stores"       element={<S><AdminStoresPage /></S>} />
            <Route path="settings"     element={<S><AdminSettingsPage /></S>} />
          </Route>

          {/* ── Legacy redirects ── */}
          <Route path="/admin/*" element={<Navigate to="/admin" replace />} />

          {/* ── 404 ── */}
          <Route path="*" element={<S><NotFound /></S>} />
        </Routes>
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </Router>
  );
};

export default App;
