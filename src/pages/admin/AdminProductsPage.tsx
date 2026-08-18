import { useState, useEffect, useRef } from 'react';
import { Plus, Pencil, Trash2, Search, Loader2, Upload, X, Eye, EyeOff, Star, StarOff, ImageIcon, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  getAllProductsAdmin, createProduct, updateProduct, deleteProduct,
  uploadProductImage, addProductImage, deleteProductImage
} from '@/services/products';
import { getCategories, getBrands } from '@/services/categories';
import { formatPrice, slugify } from '@/lib/utils';
import type { Product, Category, Brand } from '@/types/types';

const EMPTY_FORM = {
  name: '', slug: '', description: '', price: '', promotional_price: '',
  stock: '', warranty: '', category_id: '', brand_id: '',
  is_published: true, is_featured: false, is_new: false, technical_specs: [] as any[],
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [specInput, setSpecInput] = useState({ label: '', value: '' });
  // pending images chosen BEFORE the product is saved
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const PAGE_SIZE = 15;

  const load = async () => {
    setLoading(true);
    try {
      const { data, count } = await getAllProductsAdmin(page, PAGE_SIZE, search);
      setProducts(data); setTotal(count);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, search]);
  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
    getBrands().then(setBrands).catch(() => {});
  }, []);

  // clean up object URLs on unmount / dialog close
  useEffect(() => {
    if (!dialogOpen) {
      pendingPreviews.forEach(u => URL.revokeObjectURL(u));
      setPendingFiles([]);
      setPendingPreviews([]);
    }
  }, [dialogOpen]);

  const openCreate = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({
      name: p.name, slug: p.slug, description: p.description || '',
      price: String(p.price), promotional_price: String(p.promotional_price || ''),
      stock: String(p.stock), warranty: p.warranty || '',
      category_id: p.category_id || '', brand_id: p.brand_id || '',
      is_published: p.is_published, is_featured: p.is_featured, is_new: p.is_new,
      technical_specs: p.technical_specs || [],
    });
    setDialogOpen(true);
  };

  // Upload a list of files for a known product id
  const uploadFilesForProduct = async (productId: string, files: File[], existingCount = 0) => {
    for (let i = 0; i < files.length; i++) {
      const url = await uploadProductImage(files[i], productId);
      await addProductImage(productId, url, existingCount + i === 0);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.price) { toast.error('Nom et prix sont requis'); return; }
    setSaving(true);
    try {
      const data: any = {
        name: form.name, slug: form.slug || slugify(form.name),
        description: form.description || null, price: Number(form.price),
        promotional_price: form.promotional_price ? Number(form.promotional_price) : null,
        stock: Number(form.stock) || 0, warranty: form.warranty || null,
        category_id: form.category_id || null, brand_id: form.brand_id || null,
        is_published: form.is_published, is_featured: form.is_featured, is_new: form.is_new,
        technical_specs: form.technical_specs,
      };

      if (editProduct) {
        await updateProduct(editProduct.id, data);
        // upload any newly chosen files for existing product
        if (pendingFiles.length > 0) {
          setUploadLoading(true);
          await uploadFilesForProduct(editProduct.id, pendingFiles, editProduct.product_images?.length || 0);
          setUploadLoading(false);
        }
        toast.success('Produit mis à jour');
        setDialogOpen(false);
      } else {
        // Step 1: create product (returns row with id)
        const created = await createProduct(data);
        // Step 2: upload pending files immediately using the new id
        if (pendingFiles.length > 0) {
          setUploadLoading(true);
          try {
            await uploadFilesForProduct(created.id, pendingFiles, 0);
            toast.success(`Produit créé avec ${pendingFiles.length} photo(s) ✓`);
          } catch (imgErr: any) {
            toast.warning('Produit créé mais erreur upload image: ' + (imgErr?.message || ''));
          } finally { setUploadLoading(false); }
        } else {
          toast.success('Produit créé ✓');
        }
        setDialogOpen(false);
      }
      load();
    } catch (e: any) { toast.error(e.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deleteProduct(deleteId); toast.success('Produit supprimé'); load(); }
    catch { toast.error('Erreur lors de la suppression'); }
    finally { setDeleteId(null); }
  };

  const handleToggle = async (p: Product, field: 'is_published' | 'is_featured') => {
    try {
      await updateProduct(p.id, { [field]: !p[field] });
      toast.success(`${field === 'is_published' ? (!p.is_published ? 'Publié' : 'Dépublié') : (!p.is_featured ? 'Mis à la une' : 'Retiré de la une')}`);
      load();
    } catch { toast.error('Erreur'); }
  };

  // Pick files — works for both new and existing product
  const handlePickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    const valid = files.filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
    const invalid = files.length - valid.length;
    if (invalid > 0) toast.warning(`${invalid} fichier(s) ignoré(s) (non-image ou >5MB)`);
    if (!valid.length) return;

    if (editProduct) {
      // For existing product — upload immediately
      (async () => {
        setUploadLoading(true);
        try {
          await uploadFilesForProduct(editProduct.id, valid, editProduct.product_images?.length || 0);
          toast.success(`${valid.length} image(s) ajoutée(s)`);
          const { data } = await getAllProductsAdmin(1, 1, editProduct.slug);
          if (data[0]) setEditProduct(data[0]);
          load();
        } catch (err: any) { toast.error(err?.message || 'Erreur upload'); }
        finally { setUploadLoading(false); }
      })();
    } else {
      // For new product — queue locally, upload after create
      const previews = valid.map(f => URL.createObjectURL(f));
      setPendingFiles(prev => [...prev, ...valid]);
      setPendingPreviews(prev => [...prev, ...previews]);
    }
  };

  const removePending = (i: number) => {
    URL.revokeObjectURL(pendingPreviews[i]);
    setPendingFiles(f => f.filter((_, idx) => idx !== i));
    setPendingPreviews(p => p.filter((_, idx) => idx !== i));
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await deleteProductImage(imageId);
      toast.success('Image supprimée');
      if (editProduct) {
        const { data } = await getAllProductsAdmin(1, 1, editProduct.slug);
        if (data[0]) setEditProduct(data[0]);
      }
      load();
    } catch { toast.error('Erreur'); }
  };

  const addSpec = () => {
    if (!specInput.label || !specInput.value) return;
    setForm((f: any) => ({ ...f, technical_specs: [...f.technical_specs, { ...specInput }] }));
    setSpecInput({ label: '', value: '' });
  };

  const removeSpec = (i: number) => {
    setForm((f: any) => ({ ...f, technical_specs: f.technical_specs.filter((_: any, idx: number) => idx !== i) }));
  };

  // Merged image list: saved images + pending previews
  const allImages = [
    ...(editProduct?.product_images || []).map(img => ({ id: img.id, url: img.url, isPending: false })),
    ...pendingPreviews.map((url, i) => ({ id: `pending-${i}`, url, isPending: true, pendingIdx: i })),
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Gestion des produits</h1>
          <p className="text-sm text-muted-foreground">{total} produit{total !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="neu-btn-primary flex items-center gap-2 px-4 py-2.5 text-sm">
          <Plus className="w-4 h-4" /> Nouveau produit
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Rechercher un produit..." className="neu-input pl-9 text-sm py-2" />
      </div>

      <div className="neu-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                {['Image', 'Nom', 'Catégorie', 'Prix', 'Stock', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array(8).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={7} className="py-3 px-4"><div className="h-10 bg-muted rounded animate-pulse" /></td></tr>
              )) : products.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">Aucun produit trouvé</td></tr>
              ) : products.map(p => {
                const img = p.product_images?.find(i => i.is_primary) || p.product_images?.[0];
                return (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-2 px-4">
                      {img ? <img src={img.url} alt={p.name} className="w-10 h-10 object-cover rounded-lg" /> :
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center"><ImageIcon className="w-4 h-4 text-muted-foreground/40" /></div>}
                    </td>
                    <td className="py-2 px-4">
                      <div className="font-medium max-w-[200px] truncate whitespace-nowrap">{p.name}</div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">{p.brands?.name}</div>
                    </td>
                    <td className="py-2 px-4 text-muted-foreground whitespace-nowrap">{p.categories?.name || '—'}</td>
                    <td className="py-2 px-4 whitespace-nowrap">
                      <div className="font-semibold text-primary">{formatPrice(p.price)}</div>
                      {p.promotional_price && <div className="text-xs text-accent">{formatPrice(p.promotional_price)}</div>}
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${p.is_published ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                        {p.is_published ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="py-2 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleToggle(p, 'is_published')} title={p.is_published ? 'Dépublier' : 'Publier'}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                          {p.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleToggle(p, 'is_featured')} title={p.is_featured ? 'Retirer de la une' : 'Mettre à la une'}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-yellow-500">
                          {p.is_featured ? <Star className="w-4 h-4 text-yellow-500" /> : <StarOff className="w-4 h-4" />}
                        </button>
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

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="neu-btn px-3 py-1.5 text-sm disabled:opacity-40">Préc.</button>
          <span className="text-sm font-medium">{page} / {Math.ceil(total / PAGE_SIZE)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / PAGE_SIZE)} className="neu-btn px-3 py-1.5 text-sm disabled:opacity-40">Suiv.</button>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={open => { setDialogOpen(open); }}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editProduct ? 'Modifier le produit' : 'Nouveau produit'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* ── Form fields FIRST ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Nom *</label>
                <input value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} className="neu-input text-sm" placeholder="Nom du produit" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Catégorie</label>
                <select value={form.category_id} onChange={e => setForm((f: any) => ({ ...f, category_id: e.target.value }))} className="neu-input text-sm">
                  <option value="">-- Aucune --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Marque</label>
                <select value={form.brand_id} onChange={e => setForm((f: any) => ({ ...f, brand_id: e.target.value }))} className="neu-input text-sm">
                  <option value="">-- Aucune --</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Prix (FCFA) *</label>
                <input type="number" value={form.price} onChange={e => setForm((f: any) => ({ ...f, price: e.target.value }))} className="neu-input text-sm" placeholder="0" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Prix promotionnel (FCFA)</label>
                <input type="number" value={form.promotional_price} onChange={e => setForm((f: any) => ({ ...f, promotional_price: e.target.value }))} className="neu-input text-sm" placeholder="Optionnel" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Stock</label>
                <input type="number" value={form.stock} onChange={e => setForm((f: any) => ({ ...f, stock: e.target.value }))} className="neu-input text-sm" placeholder="0" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Garantie</label>
                <input value={form.warranty} onChange={e => setForm((f: any) => ({ ...f, warranty: e.target.value }))} className="neu-input text-sm" placeholder="Ex: 1 an" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} rows={3} className="neu-input text-sm resize-none" placeholder="Description du produit" />
              </div>
            </div>

            {/* ── Technical specs ── */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Caractéristiques techniques</label>
              {form.technical_specs.map((spec: any, i: number) => (
                <div key={i} className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">{spec.label}: {spec.value}</span>
                  <button onClick={() => removeSpec(i)} className="text-red-500 hover:text-red-700 text-xs"><X className="w-3 h-3" /></button>
                </div>
              ))}
              <div className="flex gap-2">
                <input value={specInput.label} onChange={e => setSpecInput(s => ({ ...s, label: e.target.value }))} placeholder="Attribut" className="neu-input text-xs py-2 flex-1" />
                <input value={specInput.value} onChange={e => setSpecInput(s => ({ ...s, value: e.target.value }))} placeholder="Valeur" className="neu-input text-xs py-2 flex-1" />
                <button onClick={addSpec} className="neu-btn-primary px-3 py-2 text-xs">+</button>
              </div>
            </div>

            {/* ── Flags ── */}
            <div className="flex flex-wrap gap-4">
              {[
                { key: 'is_published', label: 'Publié' },
                { key: 'is_featured', label: 'À la une' },
                { key: 'is_new', label: 'Nouveau' },
              ].map(f => (
                <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form[f.key]} onChange={e => setForm((fr: any) => ({ ...fr, [f.key]: e.target.checked }))} className="w-4 h-4 accent-primary" />
                  <span className="text-sm">{f.label}</span>
                </label>
              ))}
            </div>

            {/* ── Photos — always visible, queued for new products ── */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                Photos du produit
                {!editProduct && pendingFiles.length > 0 && (
                  <span className="ml-2 text-primary font-bold">({pendingFiles.length} en attente — seront uploadées à la création)</span>
                )}
              </label>

              <div className="flex flex-wrap gap-2">
                {/* Existing saved images */}
                {editProduct?.product_images?.map(img => (
                  <div key={img.id} className="relative w-16 h-16 group">
                    <img src={img.url} alt="" className="w-full h-full object-cover rounded-lg border border-border" />
                    <button onClick={() => handleDeleteImage(img.id)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Pending preview images (new product only) */}
                {pendingPreviews.map((url, i) => (
                  <div key={`pending-${i}`} className="relative w-16 h-16 group">
                    <img src={url} alt="" className="w-full h-full object-cover rounded-lg border-2 border-primary/60" />
                    <div className="absolute -top-1 -left-1">
                      <CheckCircle2 className="w-4 h-4 text-primary bg-white rounded-full" />
                    </div>
                    <button onClick={() => removePending(i)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {/* Add button — always shown */}
                <button onClick={() => fileRef.current?.click()} disabled={uploadLoading}
                  className="w-16 h-16 rounded-lg border-2 border-dashed border-primary/40 flex flex-col items-center justify-center gap-0.5 text-primary hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50">
                  {uploadLoading
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : <><Upload className="w-4 h-4" /><span className="text-[9px] font-semibold">Ajouter</span></>}
                </button>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePickFiles} />
              </div>

              {!editProduct && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  Sélectionnez vos photos maintenant — elles seront uploadées automatiquement lors de la création.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <button onClick={() => setDialogOpen(false)} className="neu-btn px-4 py-2 text-sm">Annuler</button>
            <button onClick={handleSave} disabled={saving || uploadLoading} className="neu-btn-primary flex items-center gap-2 px-4 py-2 text-sm">
              {(saving || uploadLoading) && <Loader2 className="w-4 h-4 animate-spin" />}
              {editProduct ? 'Mettre à jour' : `Créer${pendingFiles.length > 0 ? ` + ${pendingFiles.length} photo(s)` : ''}`}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce produit?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible. Le produit sera définitivement supprimé.</AlertDialogDescription>
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
