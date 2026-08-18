import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { getAllPromotionsAdmin, createPromotion, updatePromotion, deletePromotion, uploadPromotionImage } from '@/services/promotions';
import { getAllProductsAdmin } from '@/services/products';
import { formatPrice, formatDateShort, getDiscountPercent } from '@/lib/utils';
import type { Promotion, Product } from '@/types/types';

const EMPTY_FORM = {
  title: '', description: '', image_url: '', product_id: '',
  original_price: '', promotional_price: '', start_date: '', end_date: '', is_active: true,
};

export default function AdminPromotionsPage() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editPromo, setEditPromo] = useState<Promotion | null>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);

  const load = async () => {
    setLoading(true);
    try {
      const [ps, prods] = await Promise.all([getAllPromotionsAdmin(), getAllProductsAdmin(1, 200)]);
      setPromos(ps); setProducts(prods.data);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const discount = form.original_price && form.promotional_price
    ? getDiscountPercent(Number(form.original_price), Number(form.promotional_price)) : 0;

  const openCreate = () => { setEditPromo(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (p: Promotion) => {
    setEditPromo(p);
    setForm({
      title: p.title, description: p.description || '', image_url: p.image_url || '',
      product_id: p.product_id || '', original_price: String(p.original_price),
      promotional_price: String(p.promotional_price),
      start_date: p.start_date.slice(0, 16), end_date: p.end_date.slice(0, 16),
      is_active: p.is_active,
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPromotionImage(file);
      setForm((f: any) => ({ ...f, image_url: url }));
      toast.success('Image chargée');
    } catch { toast.error('Erreur upload'); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.title || !form.original_price || !form.promotional_price || !form.start_date || !form.end_date) {
      toast.error('Remplissez tous les champs obligatoires'); return;
    }
    setSaving(true);
    const data: any = {
      title: form.title, description: form.description || null, image_url: form.image_url || null,
      product_id: form.product_id || null, original_price: Number(form.original_price),
      promotional_price: Number(form.promotional_price),
      discount_percentage: getDiscountPercent(Number(form.original_price), Number(form.promotional_price)),
      start_date: new Date(form.start_date).toISOString(), end_date: new Date(form.end_date).toISOString(),
      is_active: form.is_active,
    };
    try {
      if (editPromo) await updatePromotion(editPromo.id, data);
      else await createPromotion(data);
      toast.success(editPromo ? 'Promotion mise à jour' : 'Promotion créée');
      setDialogOpen(false); load();
    } catch (e: any) { toast.error(e.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deletePromotion(deleteId); toast.success('Supprimée'); load(); }
    catch { toast.error('Erreur'); }
    finally { setDeleteId(null); }
  };

  const now = new Date().toISOString();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Promotions</h1>
          <p className="text-sm text-muted-foreground">{promos.length} promotion{promos.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="neu-btn-primary flex items-center gap-2 px-4 py-2.5 text-sm">
          <Plus className="w-4 h-4" /> Nouvelle promotion
        </button>
      </div>

      <div className="neu-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                {['Image', 'Titre', 'Produit', 'Réduction', 'Période', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array(4).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={7} className="py-3 px-4"><div className="h-10 bg-muted rounded animate-pulse" /></td></tr>
              )) : promos.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">Aucune promotion</td></tr>
              ) : promos.map(p => {
                const active = p.is_active && p.start_date <= now && p.end_date >= now;
                return (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-2 px-4">
                      {p.image_url ? <img src={p.image_url} alt={p.title} className="w-12 h-10 object-cover rounded-lg" /> :
                        <div className="w-12 h-10 bg-muted rounded-lg" />}
                    </td>
                    <td className="py-2 px-4">
                      <div className="font-medium max-w-[160px] truncate whitespace-nowrap">{p.title}</div>
                    </td>
                    <td className="py-2 px-4 text-muted-foreground text-xs whitespace-nowrap">
                      {p.products?.name ? <span className="truncate max-w-[120px] inline-block">{p.products.name}</span> : '—'}
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap">
                      <div className="text-accent font-bold">{formatPrice(p.promotional_price)}</div>
                      <div className="text-xs text-muted-foreground line-through">{formatPrice(p.original_price)}</div>
                      <div className="text-xs font-bold text-white bg-accent px-1.5 rounded inline-block">-{Math.round(p.discount_percentage)}%</div>
                    </td>
                    <td className="py-2 px-4 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateShort(p.start_date)} → {formatDateShort(p.end_date)}
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${active ? 'bg-green-100 text-green-700' : p.end_date < now ? 'bg-red-100 text-red-600' : 'bg-muted text-muted-foreground'}`}>
                        {active ? 'Active' : p.end_date < now ? 'Expirée' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteId(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editPromo ? 'Modifier la promotion' : 'Nouvelle promotion'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Titre *</label>
              <input value={form.title} onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))} className="neu-input text-sm" placeholder="Titre de la promotion" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Produit concerné</label>
              <select value={form.product_id} onChange={e => {
                const p = products.find(p => p.id === e.target.value);
                setForm((f: any) => ({
                  ...f, product_id: e.target.value,
                  original_price: p ? String(p.price) : f.original_price,
                }));
              }} className="neu-input text-sm">
                <option value="">-- Aucun produit spécifique --</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Prix original *</label>
                <input type="number" value={form.original_price} onChange={e => setForm((f: any) => ({ ...f, original_price: e.target.value }))} className="neu-input text-sm" placeholder="0" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Prix promo *</label>
                <input type="number" value={form.promotional_price} onChange={e => setForm((f: any) => ({ ...f, promotional_price: e.target.value }))} className="neu-input text-sm" placeholder="0" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Réduction</label>
                <div className="neu-pressed rounded-xl px-4 py-3 text-center font-bold text-accent text-sm">{discount}%</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Date début *</label>
                <input type="datetime-local" value={form.start_date} onChange={e => setForm((f: any) => ({ ...f, start_date: e.target.value }))} className="neu-input text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Date fin *</label>
                <input type="datetime-local" value={form.end_date} onChange={e => setForm((f: any) => ({ ...f, end_date: e.target.value }))} className="neu-input text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
              <textarea value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} rows={2} className="neu-input text-sm resize-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Image</label>
              {form.image_url && <img src={form.image_url} alt="" className="w-full h-28 object-cover rounded-xl mb-2" />}
              <div className="flex gap-2">
                <input value={form.image_url} onChange={e => setForm((f: any) => ({ ...f, image_url: e.target.value }))} className="neu-input text-sm flex-1" placeholder="URL image" />
                <label className="neu-btn flex items-center gap-1 px-3 py-2 text-xs cursor-pointer">
                  {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm((f: any) => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 accent-primary" />
              <span className="text-sm">Promotion active</span>
            </label>
          </div>
          <DialogFooter>
            <button onClick={() => setDialogOpen(false)} className="neu-btn px-4 py-2 text-sm">Annuler</button>
            <button onClick={handleSave} disabled={saving} className="neu-btn-primary flex items-center gap-2 px-4 py-2 text-sm">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editPromo ? 'Mettre à jour' : 'Créer'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette promotion?</AlertDialogTitle>
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
