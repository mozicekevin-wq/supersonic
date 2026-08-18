import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tag, ShoppingCart, Megaphone,
  Percent, Users, Store, Settings, LogOut, Menu, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/db/supabase';

const LOGO_URL = 'https://miaoda-conversation-file.s3cdn.medo.dev/user-dg06phmgr9c0/app-dsazr1cm25tt/20260817/file_00000000971482438d70a20248281418.png';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  // Reset badge when visiting orders page
  useEffect(() => {
    if (location.pathname.includes('/admin/orders')) {
      setNewOrderCount(0);
    }
  }, [location.pathname]);

  // Load initial new order count + subscribe to realtime
  useEffect(() => {
    // fetch current unread count (status = 'new')
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new')
      .then(({ count }) => { if (count) setNewOrderCount(count); });

    const channel = supabase
      .channel('admin-layout-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
        setNewOrderCount(n => n + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/admin' },
    { icon: Package, label: 'Produits', path: '/admin/products' },
    { icon: Tag, label: 'Catégories & Marques', path: '/admin/categories' },
    {
      icon: ShoppingCart,
      label: 'Commandes',
      path: '/admin/orders',
      badge: newOrderCount > 0 ? newOrderCount : undefined,
    },
    { icon: Megaphone, label: 'Publications', path: '/admin/publications' },
    { icon: Percent, label: 'Promotions', path: '/admin/promotions' },
    { icon: Users, label: 'Utilisateurs', path: '/admin/users' },
    { icon: Store, label: 'Magasins', path: '/admin/stores' },
    { icon: Settings, label: 'Paramètres', path: '/admin/settings' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/" className="block">
          <img src={LOGO_URL} alt="Supersonic" className="h-9 w-auto" />
        </Link>
        <div className="mt-2 text-xs text-sidebar-foreground/60">Espace Administration</div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map(({ icon: Icon, label, path, badge }) => {
          const isActive = path === '/admin'
            ? location.pathname === '/admin'
            : location.pathname.startsWith(path);
          return (
            <Link key={path} to={path}
              onClick={() => setSidebarOpen(false)}
              className={`admin-sidebar-item ${isActive ? 'active' : ''}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm flex-1">{label}</span>
              {badge !== undefined && (
                <span className="ml-auto min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
              {isActive && !badge && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="px-4 py-2 mb-2">
          <div className="text-sm font-medium text-sidebar-foreground truncate">
            {profile?.full_name || profile?.email || 'Admin'}
          </div>
          <div className="text-xs text-sidebar-foreground/50 capitalize">{profile?.role}</div>
        </div>
        <button onClick={handleSignOut}
          className="admin-sidebar-item w-full text-red-400 hover:!bg-red-500/10 hover:!text-red-300">
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Déconnexion</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-sidebar flex flex-col">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 overflow-x-hidden flex flex-col">
        {/* Mobile header */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-sidebar border-b border-sidebar-border">
          <button onClick={() => setSidebarOpen(true)} className="text-white relative">
            <Menu className="w-5 h-5" />
            {newOrderCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {newOrderCount > 9 ? '9+' : newOrderCount}
              </span>
            )}
          </button>
          <img src={LOGO_URL} alt="Supersonic" className="h-8 w-auto" />
          <span className="text-white/70 text-sm ml-auto">Admin</span>
        </div>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
