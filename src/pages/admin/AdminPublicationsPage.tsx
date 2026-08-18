import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { getAllPublicationsAdmin, createPublication, updatePublication, deletePublication, uploadPublicationImage } from '@/services/publications';
import { formatDateShort } from '@/lib/utils';
import type { Publication, PublicationStatus, PublicationType } from '@/types/types';

const STATUS_LABELS: Record<PublicationStatus, string> = { draft: 'Brouillon', published: 'Publiée', scheduled: 'Programmée' };
const STATUS_COLORS: Record<PublicationStatus, string> = { draft: 'bg-muted text-muted-foreground', published: 'bg-green-100 text-green-700', scheduled: 'bg-blue-100 text-blue-700' };
const TYPE_OPTIONS: { value: PublicationType; label: string }[] = [
  { value: 'news', label: 'Actualité' }, { value: 'promotion', label: 'Promotion' },
  { value: 'announcement', label: 'Annonce' }, { value: 'event', label: 'Événement' },
  { value: 'special_offer', label: 'Offre spéciale' }, { value: 'commercial', label: 'Commercial' },
];

const EMPTY_FORM = {
  title: '', content: '', excerpt: '', type: 'news' as PublicationType,
  status: 'draft' as PublicationStatus, published_at: '', scheduled_at: '', image_url: '',
};

export default function AdminPublicationsPage() {
  const [pubs, setPubs] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editPub, setEditPub] = useState<Publication | null>(null);
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM);

  const load = async () => {
    setLoading(true);
    try { setPubs(await getAllPublicationsAdmin()); }
    catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditPub(null); setForm(EMPTY_FORM); setDialogOpen(true); };
  const openEdit = (p: Publication) => {
    setEditPub(p);
    setForm({
      title: p.title, content: p.content || '', excerpt: p.excerpt || '',
      type: p.type, status: p.status,
      published_at: p.published_at ? p.published_at.slice(0, 16) : '',
      scheduled_at: p.scheduled_at ? p.scheduled_at.slice(0, 16) : '',
      image_url: p.image_url || '',
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { uploadPublicationImage: upload } = await import('@/services/publications');
      const url = await upload(file);
      setForm(f => ({ ...f, image_url: url }));
      toast.success('Image chargée');
    } catch { toast.error('Erreur upload image'); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.title) { toast.error('Le titre est requis'); return; }
    setSaving(true);
    const now = new Date().toISOString();
    const data: any = {
      title: form.title, content: form.content || null, excerpt: form.excerpt || null,
      type: form.type, status: form.status,
      image_url: form.image_url || null,
      published_at: form.status === 'published' ? (form.published_at || now) : (form.published_at || null),
      scheduled_at: form.scheduled_at || null,
    };
    try {
      if (editPub) await updatePublication(editPub.id, data);
      else await createPublication(data);
      toast.success(editPub ? 'Publication mise à jour' : 'Publication créée');
      setDialogOpen(false); load();
    } catch (e: any) { toast.error(e.message || 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await deletePublication(deleteId); toast.success('Publication supprimée'); load(); }
    catch { toast.error('Erreur'); }
    finally { setDeleteId(null); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Publications</h1>
          <p className="text-sm text-muted-foreground">{pubs.length} publication{pubs.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="neu-btn-primary flex items-center gap-2 px-4 py-2.5 text-sm">
          <Plus className="w-4 h-4" /> Nouvelle publication
        </button>
      </div>

      <div className="neu-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                {['Image', 'Titre', 'Type', 'Statut', 'Date publication', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array(5).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={6} className="py-3 px-4"><div className="h-10 bg-muted rounded animate-pulse" /></td></tr>
              )) : pubs.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Aucune publication</td></tr>
              ) : pubs.map(p => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="py-2 px-4">
                    {p.image_url ? <img src={p.image_url} alt={p.title} className="w-12 h-10 object-cover rounded-lg" /> :
                      <div className="w-12 h-10 bg-muted rounded-lg" />}
                  </td>
                  <td className="py-2 px-4">
                    <div className="font-medium max-w-[200px] truncate whitespace-nowrap">{p.title}</div>
                    {p.excerpt && <div className="text-xs text-muted-foreground truncate max-w-[200px] whitespace-nowrap">{p.excerpt}</div>}
                  </td>
                  <td className="py-2 px-4 whitespace-nowrap">
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{TYPE_OPTIONS.find(t => t.value === p.type)?.label || p.type}</span>
                  </td>
                  <td className="py-2 px-4 whitespace-nowrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status]}`}>
                      {STATUS_LABELS[p.status]}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-muted-foreground text-xs whitespace-nowrap">
                    {p.published_at ? formatDateShort(p.published_at) : '—'}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editPub ? 'Modifier la publication' : 'Nouvelle publication'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Titre *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="neu-input text-sm" placeholder="Titre de la publication" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as PublicationType }))} className="neu-input text-sm">
                  {TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Statut</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as PublicationStatus }))} className="neu-input text-sm">
                  <option value="draft">Brouillon</option>
                  <option value="published">Publier maintenant</option>
                  <option value="scheduled">Programmer</option>
                </select>
              </div>
            </div>
            {form.status === 'scheduled' && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Date de publication programmée</label>
                <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} className="neu-input text-sm" />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Extrait</label>
              <input value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} className="neu-input text-sm" placeholder="Résumé court" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Contenu</label>
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={6} className="neu-input text-sm resize-none" placeholder="Contenu de la publication..." />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Image</label>
              {form.image_url && <img src={form.image_url} alt="" className="w-full h-32 object-cover rounded-xl mb-2" />}
              <div className="flex gap-2 items-center">
                <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className="neu-input text-sm flex-1" placeholder="URL de l'image" />
                <label className="neu-btn flex items-center gap-1 px-3 py-2 text-xs cursor-pointer">
                  {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                  Upload
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setDialogOpen(false)} className="neu-btn px-4 py-2 text-sm">Annuler</button>
            <button onClick={handleSave} disabled={saving} className="neu-btn-primary flex items-center gap-2 px-4 py-2 text-sm">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editPub ? 'Mettre à jour' : 'Créer'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette publication?</AlertDialogTitle>
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
