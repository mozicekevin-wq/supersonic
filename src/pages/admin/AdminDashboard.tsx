import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, CheckCircle, XCircle, Megaphone, Percent,
  ShoppingCart, Users, TrendingUp, ArrowUpRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getDashboardStats, getOrdersChartData } from '@/services/admin';
import { formatPrice, formatDateShort } from '@/lib/utils';
import type { DashboardStats, Order } from '@/types/types';

const ORDER_STATUS_LABELS: Record<string, string> = {
  new: 'Nouvelle', in_progress: 'En cours', confirmed: 'Confirmée',
  prepared: 'Préparée', delivered: 'Livrée', cancelled: 'Annulée',
};
const STATUS_CLASS: Record<string, string> = {
  new: 'status-new', in_progress: 'status-in-progress', confirmed: 'status-confirmed',
  prepared: 'status-prepared', delivered: 'status-delivered', cancelled: 'status-cancelled',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getOrdersChartData()])
      .then(([s, c]) => { setStats(s); setChartData(c); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { icon: Package, label: 'Total produits', value: stats.total_products, link: '/admin/products', color: 'bg-primary/10 text-primary' },
    { icon: CheckCircle, label: 'En stock', value: stats.available_products, link: '/admin/products', color: 'bg-green-100 text-green-700' },
    { icon: XCircle, label: 'Rupture stock', value: stats.out_of_stock, link: '/admin/products', color: 'bg-red-100 text-red-700' },
    { icon: Megaphone, label: 'Publications', value: stats.total_publications, link: '/admin/publications', color: 'bg-purple-100 text-purple-700' },
    { icon: Percent, label: 'Promotions actives', value: stats.active_promotions, link: '/admin/promotions', color: 'bg-orange-100 text-orange-700' },
    { icon: ShoppingCart, label: 'Total commandes', value: stats.total_orders, link: '/admin/orders', color: 'bg-blue-100 text-blue-700' },
    { icon: Users, label: 'Clients', value: stats.total_customers, link: '/admin/users', color: 'bg-teal-100 text-teal-700' },
    { icon: TrendingUp, label: 'Activité 30j', value: chartData.reduce((s, d) => s + d.orders, 0), link: '#', color: 'bg-accent/10 text-accent' },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground text-sm">Vue d'ensemble de Société Supersonic</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? Array(8).fill(0).map((_, i) => (
          <div key={i} className="neu-card p-4 animate-pulse">
            <div className="h-8 w-8 bg-muted rounded-lg mb-3" />
            <div className="h-6 bg-muted rounded w-1/2 mb-1" />
            <div className="h-3 bg-muted rounded w-3/4" />
          </div>
        )) : statCards.map(card => (
          <Link key={card.label} to={card.link} className="neu-card p-4 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{card.label}</div>
            <ArrowUpRight className="w-3 h-3 text-muted-foreground mt-2 group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>

      {/* Chart */}
      <div className="neu-card p-6">
        <h2 className="font-bold mb-4">Activité des commandes (30 derniers jours)</h2>
        {chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            Aucune donnée disponible
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                labelFormatter={d => `Date: ${d}`}
                formatter={(v: any, n: string) => [n === 'orders' ? `${v} commandes` : formatPrice(v), n === 'orders' ? 'Commandes' : 'Montant']} />
              <Area type="monotone" dataKey="orders" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent orders */}
      <div className="neu-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Dernières commandes</h2>
          <Link to="/admin/orders" className="text-sm text-primary font-medium hover:underline">Voir tout</Link>
        </div>
        {loading ? (
          <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}</div>
        ) : !stats?.recent_orders?.length ? (
          <div className="text-center text-muted-foreground py-8">Aucune commande pour l'instant</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['N°', 'Client', 'Produit', 'Montant', 'Ville', 'Date', 'Statut'].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs text-muted-foreground font-semibold whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.recent_orders.map((order: Order) => (
                  <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-xs whitespace-nowrap">{order.order_number}</td>
                    <td className="py-2.5 px-3 font-medium whitespace-nowrap">{order.customer_name}</td>
                    <td className="py-2.5 px-3 text-muted-foreground max-w-[160px] truncate whitespace-nowrap">{order.product_name}</td>
                    <td className="py-2.5 px-3 font-semibold text-primary whitespace-nowrap">{formatPrice(order.total_amount)}</td>
                    <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{order.customer_city}</td>
                    <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{formatDateShort(order.created_at)}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={STATUS_CLASS[order.status] || 'status-new'}>
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
