import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, Upload, Image as ImageIcon, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { getCategories, createCategory, updateCategory, deleteCategory, getBrands, createBrand, updateBrand, deleteBrand, uploadBrandLogo } from '@/services/categories';
import { slugify } from '@/lib/utils';
import type { Category, Brand } from '@/types/types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [tab, setTab] = useState<'categories' | 'brands'>('categories');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'cat' | 'brand' } | null>(null);
  const [editItem, setEditItem] = useState<Category | Brand | null>(null);
  const [form, setForm] = useState({ name: '', description: '', slug: '', logoUrl: '' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [brandSearch, setBrandSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [cats, brnds] = await Promise.all([getCategories(), getBrands()]);
      setCategories(cats); setBrands(brnds);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const resetLogo = () => { setLogoFile(null); setLogoPreview(''); };
  const openCreate = () => {
    setEditItem(null);
    setForm({ name: '', description: '', slug: '', logoUrl: '' });
    resetLogo();
    setDialogOpen(true);
  };
  const openEdit = (item: Category | Brand) => {
    setEditItem(item);
    setForm({ name: item.name, description: item.description || '', slug: item.slug, logoUrl: 'logo_url' in item ? (item.logo_url || '') : '' });
    setLogoFile(null);
    setLogoPreview('logo_url' in item ? (item.logo_url || '') : '');
    setDialogOpen(true);
  };

  const handleLogoChange = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Sélectionnez une image'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('L’image doit faire moins de 5 Mo'); return; }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('Le nom est requis'); return; }
    setSaving(true);
    const data = { name: form.name.trim(), slug: slugify(form.slug || form.name), description: form.description.trim() || null };
    try {
      if (tab === 'categories') {
        if (editItem) await updateCategory(editItem.id, data);
        else await createCategory(data);
      } else {
        const conflictingBrand = brands.find(b => b.id !== editItem?.id && (b.name.trim().toLowerCase() === data.name.toLowerCase() || b.slug === data.slug));
        if (conflictingBrand) {
          if (!logoFile) {
            toast.error(`La marque « ${conflictingBrand.name} » existe déjà. Ouvrez-la avec Modifier pour mettre son logo à jour.`);
            return;
          }
          const logoUrl = await uploadBrandLogo(logoFile, conflictingBrand.id);
          await updateBrand(conflictingBrand.id, { logo_url: logoUrl });
          toast.success(`Logo de ${conflictingBrand.name} mis à jour`);
        } else {
          const savedBrand = editItem
            ? (await updateBrand(editItem.id, data), editItem as Brand)
            : await createBrand(data);
          if (logoFile) {
            const logoUrl = await uploadBrandLogo(logoFile, savedBrand.id);
            await updateBrand(savedBrand.id, { logo_url: logoUrl });
          }
          toast.success(editItem ? 'Marque mise à jour' : 'Marque créée');
        }
      }
      if (tab === 'categories') toast.success(editItem ? 'Catégorie mise à jour' : 'Catégorie créée');
      setDialogOpen(false); load();
    } catch (e: any) {
      const message = String(e?.message || '');
      toast.error(message.includes('brands_name_key') || message.toLowerCase().includes('duplicate key')
        ? 'Cette marque existe déjà. Ouvrez-la avec Modifier pour ajouter ou remplacer son logo.'
        : (message || 'Erreur'));
    }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'cat') await deleteCategory(deleteTarget.id);
      else await deleteBrand(deleteTarget.id);
      toast.success('Supprimé');
      load();
    } catch (e: any) { toast.error(e.message?.includes('foreign key') ? 'Impossible: des produits utilisent cet élément' : 'Erreur'); }
    finally { setDeleteTarget(null); }
  };

  const items = tab === 'categories' ? categories : brands;
  const filteredItems = tab === 'brands' && brandSearch.trim()
    ? brands.filter(brand => [brand.name, brand.slug, brand.description || ''].some(value => value.toLowerCase().includes(brandSearch.trim().toLowerCase())))
    : items;
  const typeLabel = tab === 'categories' ? 'catégorie' : 'marque';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Catégories &amp; Marques</h1>
          <p className="text-sm text-muted-foreground">Gérez les catégories de produits et les marques</p>
        </div>
        <button onClick={openCreate} className="neu-btn-primary flex items-center gap-2 px-4 py-2.5 text-sm">
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['categories', 'brands'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t ? 'bg-primary text-white shadow-md' : 'neu-btn'}`}>
            {t === 'categories' ? `Catégories (${categories.length})` : `Marques (${brands.length})`}
          </button>
        ))}
      </div>

      {tab === 'brands' && (
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={brandSearch}
            onChange={e => setBrandSearch(e.target.value)}
            className="neu-input text-sm pl-9 pr-4"
            placeholder="Rechercher une marque par nom ou slug..."
            aria-label="Rechercher une marque"
          />
        </div>
      )}

      <div className="neu-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Nom</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Slug</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Description</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array(5).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={4} className="py-3 px-4"><div className="h-8 bg-muted rounded animate-pulse" /></td></tr>
              )              ) : filteredItems.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-10 text-muted-foreground">{tab === 'brands' && brandSearch ? 'Aucune marque trouvée' : 'Aucun élément'}</td></tr>
              ) : filteredItems.map(item => (
                <tr key={item.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="py-2.5 px-4 font-medium whitespace-nowrap">{item.name}</td>
                  <td className="py-2.5 px-4 text-muted-foreground font-mono text-xs whitespace-nowrap">{item.slug}</td>
                  <td className="py-2.5 px-4 text-muted-foreground max-w-xs truncate whitespace-nowrap">{item.description || '—'}</td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget({ id: item.id, type: tab === 'categories' ? 'cat' : 'brand' })}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? `Modifier la ${typeLabel}` : `Nouvelle ${typeLabel}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Nom *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} className="neu-input text-sm" placeholder="Nom" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Slug</label>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="neu-input text-sm font-mono" placeholder="Auto-généré" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="neu-input text-sm resize-none" placeholder="Description optionnelle" />
            </div>
            {tab === 'brands' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Logo de la marque</label>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-16 rounded-xl border border-border bg-muted/30 flex items-center justify-center overflow-hidden">
                    {logoPreview ? <img src={logoPreview} alt="Aperçu du logo" className="max-w-[85%] max-h-[75%] object-contain" /> : <ImageIcon className="w-6 h-6 text-muted-foreground" />}
                  </div>
                  <label className="neu-btn flex items-center gap-2 px-3 py-2 text-sm cursor-pointer">
                    <Upload className="w-4 h-4" />
                    {logoFile ? 'Changer l’image' : 'Ajouter une image'}
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only" onChange={e => handleLogoChange(e.target.files?.[0])} />
                  </label>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">PNG, JPG, WEBP ou SVG, 5 Mo maximum. Le logo apparaîtra sur le bouton public.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <button onClick={() => setDialogOpen(false)} className="neu-btn px-4 py-2 text-sm">Annuler</button>
            <button onClick={handleSave} disabled={saving} className="neu-btn-primary flex items-center gap-2 px-4 py-2 text-sm">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editItem ? 'Mettre à jour' : 'Créer'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet élément?</AlertDialogTitle>
            <AlertDialogDescription>Impossible si des produits utilisent cet élément.</AlertDialogDescription>
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
