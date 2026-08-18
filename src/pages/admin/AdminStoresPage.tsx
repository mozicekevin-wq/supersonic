import { useState, useEffect } from 'react';
import { Pencil, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getStores, updateStore } from '@/services/admin';
import type { Store } from '@/types/types';

export default function AdminStoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Store>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getStores().then(setStores).catch(() => toast.error('Erreur')).finally(() => setLoading(false));
  }, []);

  const startEdit = (s: Store) => { setEditId(s.id); setForm({ ...s }); };
  const cancelEdit = () => { setEditId(null); setForm({}); };

  const handleSave = async () => {
    if (!editId) return;
    setSaving(true);
    try {
      await updateStore(editId, form);
      setStores(prev => prev.map(s => s.id === editId ? { ...s, ...form } : s));
      toast.success('Magasin mis à jour'); setEditId(null);
    } catch { toast.error('Erreur lors de la mise à jour'); }
    finally { setSaving(false); }
  };

  const fields = [
    { key: 'name', label: 'Nom', type: 'text' },
    { key: 'city', label: 'Ville', type: 'text' },
    { key: 'address', label: 'Adresse', type: 'text' },
    { key: 'phone', label: 'Téléphone principal', type: 'text' },
    { key: 'phone2', label: 'Téléphone secondaire', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'opening_hours', label: "Horaires d'ouverture", type: 'text' },
    { key: 'latitude', label: 'Latitude GPS', type: 'number' },
    { key: 'longitude', label: 'Longitude GPS', type: 'number' },
    { key: 'google_maps_url', label: 'URL Google Maps', type: 'url' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">Gestion des magasins</h1>
        <p className="text-sm text-muted-foreground">Modifier les informations de vos magasins</p>
      </div>

      {loading ? (
        <div className="space-y-4">{[0, 1].map(i => <div key={i} className="neu-card h-40 animate-pulse" />)}</div>
      ) : stores.map(store => (
        <div key={store.id} className="neu-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-primary">{store.name} — {store.city}</h2>
            {editId === store.id ? (
              <div className="flex gap-2">
                <button onClick={cancelEdit} className="neu-btn px-3 py-1.5 text-sm">Annuler</button>
                <button onClick={handleSave} disabled={saving} className="neu-btn-primary flex items-center gap-1.5 px-3 py-1.5 text-sm">
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Sauvegarder
                </button>
              </div>
            ) : (
              <button onClick={() => startEdit(store)} className="neu-btn flex items-center gap-1.5 px-3 py-1.5 text-sm">
                <Pencil className="w-3.5 h-3.5" /> Modifier
              </button>
            )}
          </div>

          {editId === store.id ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fields.map(f => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">{f.label}</label>
                  <input type={f.type} value={(form as any)[f.key] || ''} onChange={e => setForm(frm => ({ ...frm, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
                    className="neu-input text-sm" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fields.map(f => (
                <div key={f.key} className="flex flex-col">
                  <span className="text-xs text-muted-foreground">{f.label}</span>
                  <span className="text-sm font-medium">{(store as any)[f.key] || '—'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
