import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import PublicLayout from '@/components/layout/PublicLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminGuard from '@/components/common/AdminGuard';

// ── Public pages (lazy-loaded) ──────────────────────────────────────────────
const HomePage           = lazy(() => import('@/pages/HomePage'));
const ProductsPage       = lazy(() => import('@/pages/ProductsPage'));
const ProductDetailPage  = lazy(() => import('@/pages/ProductDetailPage'));
const PromotionsPage     = lazy(() => import('@/pages/PromotionsPage'));
const PublicationsPage   = lazy(() => import('@/pages/PublicationsPage'));
const StoresPage         = lazy(() => import('@/pages/StoresPage'));
const ContactPage        = lazy(() => import('@/pages/ContactPage'));
const NotFound           = lazy(() => import('@/pages/NotFound'));

// ── Admin pages (lazy-loaded) ───────────────────────────────────────────────
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

// ── Fallback spinner ────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function S({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  // ── Public site (wrapped in PublicLayout) ─────────────────────────────────
  {
    name: 'Public Site',
    path: '/',
    public: true,
    element: (
      <S>
        <PublicLayout />
      </S>
    ),
  },

  // ── Admin login (standalone, no layout) ──────────────────────────────────
  {
    name: 'Admin Login',
    path: '/admin/login',
    public: true,
    element: <S><AdminLoginPage /></S>,
  },

  // ── Admin area (AdminGuard + AdminLayout) ─────────────────────────────────
  {
    name: 'Admin',
    path: '/admin',
    public: false,
    element: (
      <AdminGuard>
        <S><AdminLayout /></S>
      </AdminGuard>
    ),
  },
];
