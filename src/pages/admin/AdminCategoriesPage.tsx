import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, Upload, Image as ImageIcon, Search, Images } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { getCategories, createCategory, updateCategory, deleteCategory, getBrands, createBrand, updateBrand, deleteBrand, uploadBrandGalleryImage, uploadCategoryImage, listBrandGallery } from '@/services/categories';
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
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [categoryImagePreview, setCategoryImagePreview] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [selectedGalleryLogo, setSelectedGalleryLogo] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [cats, brnds] = await Promise.all([getCategories(), getBrands()]);
      setCategories(cats); setBrands(brnds);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const resetLogo = () => { setLogoFile(null); setLogoPreview(''); setSelectedGalleryLogo(''); };
  const resetCategoryImage = () => { setCategoryImageFile(null); setCategoryImagePreview(''); };
  const openGallery = async () => {
    setGalleryOpen(true);
    setGalleryLoading(true);
    try {
      setGalleryImages(await listBrandGallery());
    } catch (e: any) {
      toast.error(e?.message || 'Impossible de charger la galerie');
    } finally {
      setGalleryLoading(false);
    }
  };
  const selectGalleryLogo = (url: string) => {
    setSelectedGalleryLogo(url);
    setLogoFile(null);
    setLogoPreview(url);
    setForm(f => ({ ...f, logoUrl: url }));
    setGalleryOpen(false);
  };
  const openCreate = () => {
    setEditItem(null);
    setForm({ name: '', description: '', slug: '', logoUrl: '' });
    resetLogo();
    resetCategoryImage();
    setDialogOpen(true);
  };
  const openEdit = (item: Category | Brand) => {
    setEditItem(item);
    setForm({ name: item.name, description: item.description || '', slug: item.slug, logoUrl: 'logo_url' in item ? (item.logo_url || '') : '' });
    setLogoFile(null);
    setLogoPreview('logo_url' in item ? (item.logo_url || '') : '');
    setCategoryImageFile(null);
    setCategoryImagePreview('image_url' in item ? (item.image_url || '') : '');
    setDialogOpen(true);
  };

  const handleLogoChange = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Sélectionnez une image'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('L’image doit faire moins de 5 Mo'); return; }
    setLogoFile(file);
    setSelectedGalleryLogo('');
    setForm(f => ({ ...f, logoUrl: '' }));
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleCategoryImageChange = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Sélectionnez une image'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('L’image doit faire moins de 5 Mo'); return; }
    setCategoryImageFile(file);
    setCategoryImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('Le nom est requis'); return; }
    setSaving(true);
    const data = { name: form.name.trim(), slug: slugify(form.slug || form.name), description: form.description.trim() || null };
    try {
      if (tab === 'categories') {
        const savedCategory = editItem
          ? (await updateCategory(editItem.id, data), { ...editItem, ...data } as Category)
          : await createCategory(data);
        if (categoryImageFile) {
          const imageUrl = await uploadCategoryImage(categoryImageFile, savedCategory.id);
          await updateCategory(savedCategory.id, { image_url: imageUrl });
        }
      } else {
        const conflictingBrand = brands.find(b => b.id !== editItem?.id && (b.name.trim().toLowerCase() === data.name.toLowerCase() || b.slug === data.slug));
        if (conflictingBrand) {
          if (!logoFile && !selectedGalleryLogo) {
            toast.error(`La marque « ${conflictingBrand.name} » existe déjà. Choisissez une image du téléphone ou de la galerie du site.`);
            return;
          }
          const logoUrl = logoFile ? await uploadBrandGalleryImage(logoFile) : selectedGalleryLogo;
          await updateBrand(conflictingBrand.id, { logo_url: logoUrl });
          toast.success(`Logo de ${conflictingBrand.name} mis à jour`);
        } else {
          const savedBrand = editItem
            ? (await updateBrand(editItem.id, data), editItem as Brand)
            : await createBrand(data);
          if (logoFile || selectedGalleryLogo) {
            const logoUrl = logoFile ? await uploadBrandGalleryImage(logoFile) : selectedGalleryLogo;
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
        <DialogContent className="w-[calc(100vw-1.5rem)] max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{editItem ? `Modifier la ${typeLabel}` : `Nouvelle ${typeLabel}`}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Nom *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: slugify(e.target.value) }))} className="neu-input text-sm w-full min-w-0 box-border" placeholder="Nom" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Slug</label>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="neu-input text-sm font-mono w-full min-w-0 box-border" placeholder="Auto-généré" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="neu-input text-sm resize-none w-full min-w-0 box-border" placeholder="Description optionnelle" />
            </div>
            {tab === 'categories' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Image réaliste de la catégorie</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 min-w-0">
                  <div className="w-full sm:w-24 h-24 sm:h-20 rounded-xl border border-border bg-white flex items-center justify-center overflow-hidden shrink-0">
                    {categoryImagePreview
                      ? <img src={categoryImagePreview} alt="Aperçu de la catégorie" className="w-full h-full object-contain" />
                      : <ImageIcon className="w-6 h-6 text-muted-foreground" />}
                  </div>
                  <label className="neu-btn flex items-center justify-center gap-2 px-3 py-3 text-sm cursor-pointer text-center min-w-0">
                    <Upload className="w-4 h-4 shrink-0" />
                    <span className="break-words">{categoryImageFile ? 'Changer l’image' : 'Depuis le téléphone'}</span>
                    <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={e => handleCategoryImageChange(e.target.files?.[0])} />
                  </label>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">L’image sera affichée sur la carte de la catégorie. Si vous ne choisissez rien, une image réaliste par défaut sera utilisée.</p>
              </div>
            )}
            {tab === 'brands' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Logo de la marque</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 min-w-0">
                  <div className="w-full sm:w-20 h-20 sm:h-16 rounded-xl border border-border bg-muted/30 flex items-center justify-center overflow-hidden shrink-0">
                    {logoPreview ? <img src={logoPreview} alt="Aperçu du logo" className="max-w-[85%] max-h-[75%] object-contain" /> : <ImageIcon className="w-6 h-6 text-muted-foreground" />}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 min-w-0">
                    <label className="neu-btn flex items-center justify-center gap-2 px-3 py-3 text-sm cursor-pointer text-center min-w-0">
                      <Upload className="w-4 h-4 shrink-0" />
                      <span className="break-words">{logoFile ? 'Changer l’image' : 'Depuis le téléphone'}</span>
                      <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only" onChange={e => handleLogoChange(e.target.files?.[0])} />
                    </label>
                    <button type="button" onClick={openGallery} className="neu-btn flex items-center justify-center gap-2 px-3 py-3 text-sm min-w-0">
                      <Images className="w-4 h-4 shrink-0" /> <span className="break-words">Galerie du site</span>
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Choisissez une image du téléphone ou réutilisez une image déjà hébergée dans la galerie du site.</p>
              </div>
            )}
          </div>
          <DialogFooter className="w-full flex-col-reverse sm:flex-row gap-2">
            <button type="button" onClick={() => setDialogOpen(false)} className="neu-btn w-full sm:w-auto px-4 py-2 text-sm">Annuler</button>
            <button type="button" onClick={handleSave} disabled={saving} className="neu-btn-primary w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editItem ? 'Mettre à jour' : 'Créer'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Galerie des images de marques</DialogTitle>
          </DialogHeader>
          {galleryLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Chargement de la galerie...</div>
          ) : galleryImages.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Aucune image dans la galerie du site.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto p-1">
              {galleryImages.map(url => (
                <button
                  key={url}
                  type="button"
                  onClick={() => selectGalleryLogo(url)}
                  className="neu-card rounded-xl p-3 h-28 flex items-center justify-center hover:ring-2 hover:ring-primary/50 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  title="Utiliser ce logo"
                >
                  <img src={url} alt="Logo de marque disponible" className="max-w-full max-h-full object-contain" />
                </button>
              ))}
            </div>
          )}
          <DialogFooter>
            <button type="button" onClick={() => setGalleryOpen(false)} className="neu-btn px-4 py-2 text-sm">Fermer</button>
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
