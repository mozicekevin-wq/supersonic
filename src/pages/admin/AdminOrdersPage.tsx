import { useState, useEffect } from 'react';
import { Trash2, Eye, Phone, MapPin, MessageSquare, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getAllOrdersAdmin, updateOrderStatus, deleteOrder } from '@/services/orders';
import { formatPrice, formatDateShort } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types/types';
import { supabase } from '@/db/supabase';
import WhatsAppLogo from '@/components/common/WhatsAppLogo';

const STATUS_OPTIONS: { value: OrderStatus; label: string; color: string }[] = [
  { value: 'new', label: 'Nouvelle', color: 'bg-blue-100 text-blue-700' },
  { value: 'in_progress', label: 'En cours', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'confirmed', label: 'Confirmée', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'prepared', label: 'Préparée', color: 'bg-purple-100 text-purple-700' },
  { value: 'delivered', label: 'Livrée', color: 'bg-green-100 text-green-700' },
  { value: 'cancelled', label: 'Annulée', color: 'bg-red-100 text-red-700' },
];

function statusColor(s: string) {
  return STATUS_OPTIONS.find(o => o.value === s)?.color ?? 'bg-muted text-muted-foreground';
}
function statusLabel(s: string) {
  return STATUS_OPTIONS.find(o => o.value === s)?.label ?? s;
}

// Fetch the primary image URL for a product
async function getProductImageUrl(productId: string | null): Promise<string | null> {
  if (!productId) return null;
  const { data } = await supabase
    .from('product_images')
    .select('url')
    .eq('product_id', productId)
    .eq('is_primary', true)
    .maybeSingle();
  if (data?.url) return data.url;
  // fallback: any image
  const { data: any } = await supabase
    .from('product_images')
    .select('url')
    .eq('product_id', productId)
    .limit(1)
    .maybeSingle();
  return any?.url ?? null;
}

// Order detail panel
function OrderDetail({ order, onClose }: { order: Order; onClose: () => void }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const whatsappMsg = encodeURIComponent(
    `🛒 *Nouvelle commande ${order.order_number}*\n` +
    `👤 Client: ${order.customer_name}\n` +
    `📞 Tél: ${order.customer_phone}\n` +
    `📍 Ville: ${order.customer_city}\n` +
    `🏠 Adresse: ${order.delivery_address}\n` +
    `📦 Produit: ${order.product_name}\n` +
    `🔢 Qté: ${order.quantity}\n` +
    `💰 Total: ${formatPrice(order.total_amount)}\n` +
    (order.comment ? `💬 Note: ${order.comment}\n` : '') +
    `📅 Date: ${formatDateShort(order.created_at)}`
  );

  useEffect(() => {
    getProductImageUrl(order.product_id).then(setImgUrl);
  }, [order.product_id]);

  return (
    <div className="space-y-4">
      {/* Product */}
      <div className="flex gap-3 p-3 rounded-xl bg-muted/40 border border-border">
        {imgUrl
          ? <img src={imgUrl} alt={order.product_name} className="w-20 h-20 object-cover rounded-lg shrink-0 border border-border" />
          : <div className="w-20 h-20 bg-muted rounded-lg shrink-0 flex items-center justify-center"><Package className="w-6 h-6 text-muted-foreground/40" /></div>
        }
        <div className="min-w-0">
          <div className="font-semibold text-sm leading-snug">{order.product_name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Quantité: <strong>{order.quantity}</strong></div>
          <div className="text-xs text-muted-foreground">Prix unit.: <strong>{formatPrice(order.product_price)}</strong></div>
          <div className="text-base font-bold text-primary mt-1">{formatPrice(order.total_amount)}</div>
        </div>
      </div>

      {/* Client info */}
      <div className="grid grid-cols-1 gap-2 text-sm">
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/30">
          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-primary text-xs font-bold">{order.customer_name[0]?.toUpperCase()}</span>
          </div>
          <div>
            <div className="font-semibold">{order.customer_name}</div>
            <div className="text-muted-foreground text-xs">{formatDateShort(order.created_at)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/30">
          <Phone className="w-4 h-4 text-primary shrink-0" />
          <a href={`tel:${order.customer_phone}`} className="hover:text-primary transition-colors font-medium">{order.customer_phone}</a>
        </div>
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/30">
          <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div>
            <div className="font-medium">{order.customer_city}</div>
            <div className="text-muted-foreground text-xs">{order.delivery_address}</div>
          </div>
        </div>
        {order.comment && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200">
            <MessageSquare className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">{order.comment}</div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-1">
        <a
          href={`https://wa.me/242069999999?text=${whatsappMsg}`}
          target="_blank" rel="noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors">
          <WhatsAppLogo className="w-5 h-5" />
          Envoyer sur WhatsApp
        </a>
        <button onClick={onClose} className="neu-btn px-4 py-2 text-sm w-full">Fermer</button>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const PAGE_SIZE = 20;

  const load = async () => {
    setLoading(true);
    try {
      const { data, count } = await getAllOrdersAdmin(page, PAGE_SIZE, statusFilter === 'all' ? undefined : statusFilter);
      setOrders(data); setTotal(count);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, statusFilter]);

  // Realtime: refresh list on new orders
  useEffect(() => {
    const channel = supabase
      .channel('admin-orders-page')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, () => {
        load();
        toast.success('🛒 Nouvelle commande reçue !', { duration: 6000 });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, status);
      toast.success('Statut mis à jour');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch { toast.error('Erreur'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deleteOrder(deleteId); toast.success('Commande supprimée'); load(); }
    catch { toast.error('Erreur'); }
    finally { setDeleteId(null); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Commandes</h1>
          <p className="text-sm text-muted-foreground">{total} commande{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[{ value: 'all', label: 'Toutes' }, ...STATUS_OPTIONS].map(opt => (
          <button key={opt.value} onClick={() => { setStatusFilter(opt.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === opt.value ? 'bg-primary text-white shadow-sm' : 'neu-btn'}`}>
            {opt.label}
          </button>
        ))}
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden space-y-3">
        {loading ? Array(5).fill(0).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
        )) : orders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Aucune commande</div>
        ) : orders.map(o => (
          <div key={o.id} className="neu-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-muted-foreground">{o.order_number}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(o.status)}`}>{statusLabel(o.status)}</span>
                </div>
                <div className="font-semibold text-sm mt-0.5 truncate">{o.customer_name}</div>
                <div className="text-xs text-muted-foreground">{o.product_name} × {o.quantity}</div>
                <div className="font-bold text-primary text-sm mt-0.5">{formatPrice(o.total_amount)}</div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => setSelectedOrder(o)}
                  className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
                <button onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
                  {expandedId === o.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {expandedId === o.id && (
              <div className="mt-3 pt-3 border-t border-border space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-16">Statut:</span>
                  <Select value={o.status} onValueChange={v => handleStatusChange(o.id, v as OrderStatus)}>
                    <SelectTrigger className="h-7 text-xs flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <a href={`tel:${o.customer_phone}`} className="flex-1 text-center py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold">📞 Appeler</a>
                  <button onClick={() => setDeleteId(o.id)} className="flex-1 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold">Supprimer</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block neu-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                {['N°', 'Client', 'Téléphone', 'Produit', 'Qté', 'Montant', 'Ville', 'Date', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array(8).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={10} className="py-3 px-3"><div className="h-10 bg-muted rounded animate-pulse" /></td></tr>
              )) : orders.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-muted-foreground">Aucune commande</td></tr>
              ) : orders.map(o => (
                <tr key={o.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setSelectedOrder(o)}>
                  <td className="py-2.5 px-3 font-mono text-xs whitespace-nowrap text-muted-foreground">{o.order_number}</td>
                  <td className="py-2.5 px-3 font-semibold whitespace-nowrap">{o.customer_name}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <a href={`tel:${o.customer_phone}`} onClick={e => e.stopPropagation()} className="text-primary hover:underline">{o.customer_phone}</a>
                  </td>
                  <td className="py-2.5 px-3 max-w-[140px] whitespace-nowrap">
                    <div className="truncate text-muted-foreground" title={o.product_name}>{o.product_name}</div>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-center">{o.quantity}</td>
                  <td className="py-2.5 px-3 font-bold text-primary whitespace-nowrap">{formatPrice(o.total_amount)}</td>
                  <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">{o.customer_city}</td>
                  <td className="py-2.5 px-3 text-muted-foreground text-xs whitespace-nowrap">{formatDateShort(o.created_at)}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    <Select value={o.status} onValueChange={v => handleStatusChange(o.id, v as OrderStatus)}>
                      <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSelectedOrder(o)}
                        className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(o.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="neu-btn px-3 py-1.5 text-sm disabled:opacity-40">Préc.</button>
          <span className="text-sm font-medium">{page} / {Math.ceil(total / PAGE_SIZE)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / PAGE_SIZE)} className="neu-btn px-3 py-1.5 text-sm disabled:opacity-40">Suiv.</button>
        </div>
      )}

      {/* Order detail dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={open => !open && setSelectedOrder(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              Commande {selectedOrder?.order_number}
              {selectedOrder && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor(selectedOrder.status)}`}>
                  {statusLabel(selectedOrder.status)}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && <OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette commande?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
