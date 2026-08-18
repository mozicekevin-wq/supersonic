import { useState, useEffect, useRef } from 'react';
import { Save, Loader2, Shield, Eye, EyeOff, Upload, ImageIcon, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getSettings, upsertSetting } from '@/services/admin';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';

const SECURITY_CODE = '3004202523091996';

const SETTING_GROUPS = [
  {
    title: 'Informations générales', settings: [
      { key: 'company_name', label: 'Nom de l\'entreprise', type: 'text' },
      { key: 'company_tagline', label: 'Slogan', type: 'text' },
      { key: 'company_description', label: 'Description', type: 'textarea' },
    ],
  },
  {
    title: 'Contact', settings: [
      { key: 'phone_pn', label: 'Téléphone Pointe-Noire', type: 'text' },
      { key: 'phone_bzv', label: 'Téléphone Brazzaville', type: 'text' },
      { key: 'whatsapp', label: 'Numéro WhatsApp', type: 'text' },
      { key: 'email_general', label: 'Email général', type: 'email' },
      { key: 'email_orders', label: 'Email commandes', type: 'email' },
    ],
  },
  {
    title: 'Réseaux sociaux', settings: [
      { key: 'facebook_url', label: 'Facebook URL', type: 'url' },
      { key: 'instagram_url', label: 'Instagram URL', type: 'url' },
      { key: 'youtube_url', label: 'YouTube URL', type: 'url' },
    ],
  },
  {
    title: 'Horaires', settings: [
      { key: 'hours_weekdays', label: 'Lun-Sam', type: 'text' },
      { key: 'hours_sunday', label: 'Dimanche', type: 'text' },
    ],
  },
];

// Site images that admins can replace
const SITE_IMAGE_SLOTS = [
  { key: 'img_hero_1', label: 'Hero Slide 1', hint: 'Grand visuel plein écran (1600×900 recommandé)', aspect: 'aspect-video' },
  { key: 'img_hero_2', label: 'Hero Slide 2', hint: 'Grand visuel plein écran (1600×900 recommandé)', aspect: 'aspect-video' },
  { key: 'img_hero_3', label: 'Hero Slide 3', hint: 'Grand visuel plein écran (1600×900 recommandé)', aspect: 'aspect-video' },
  { key: 'img_store_bzv', label: 'Photo Magasin Brazzaville', hint: 'Façade ou intérieur du magasin', aspect: 'aspect-[4/3]' },
  { key: 'img_store_pn', label: 'Photo Magasin Pointe-Noire', hint: 'Façade ou intérieur du magasin', aspect: 'aspect-[4/3]' },
  { key: 'img_about', label: 'Image "À propos"', hint: 'Photo d\'équipe ou showroom', aspect: 'aspect-[4/3]' },
];

function SiteImageSlot({
  slotKey, label, hint, aspect, currentUrl, onUploaded,
}: {
  slotKey: string; label: string; hint: string; aspect: string;
  currentUrl: string; onUploaded: (key: string, url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setPreview(currentUrl); }, [currentUrl]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Fichier image requis'); return; }
    if (file.size > 8 * 1024 * 1024) { toast.error('Image trop grande (max 8 MB)'); return; }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `site/${slotKey}-${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage.from('products').upload(path, file, { contentType: file.type, upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('products').getPublicUrl(data.path);
      const url = urlData.publicUrl;
      // Persist into settings table so it survives reloads
      await upsertSetting(slotKey, url, label);
      setPreview(url);
      onUploaded(slotKey, url);
      toast.success(`${label} mis à jour`);
    } catch (err: any) {
      toast.error(err?.message || 'Erreur upload');
    } finally { setUploading(false); }
  };

  return (
    <div className="neu-card p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold text-sm">{label}</div>
          <div className="text-xs text-muted-foreground">{hint}</div>
        </div>
        {preview && <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />}
      </div>

      {/* Preview */}
      <div className={`relative w-full ${aspect} rounded-xl overflow-hidden bg-muted border border-border`}>
        {preview ? (
          <img src={preview} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-1">
            <ImageIcon className="w-8 h-8 opacity-30" />
            <span className="text-xs">Aucune image</span>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Upload button */}
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="neu-btn flex items-center gap-2 px-3 py-2 text-xs font-semibold justify-center hover:border-primary hover:text-primary transition-colors disabled:opacity-50">
        <Upload className="w-3.5 h-3.5" />
        {preview ? 'Remplacer l\'image' : 'Choisir une image'}
      </button>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [securityCode, setSecurityCode] = useState('');
  const [showSecCode, setShowSecCode] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [accountSaving, setAccountSaving] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    getSettings().then(setSettings).catch(() => toast.error('Erreur')).finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await Promise.all(Object.entries(settings).map(([key, value]) => upsertSetting(key, value)));
      toast.success('Paramètres sauvegardés');
    } catch { toast.error('Erreur lors de la sauvegarde'); }
    finally { setSaving(false); }
  };

  const handleAccountChange = async () => {
    if (securityCode !== SECURITY_CODE) { toast.error('Code de sécurité incorrect'); return; }
    if (!newEmail && !newPassword) { toast.error('Entrez un nouvel email ou mot de passe'); return; }
    setAccountSaving(true);
    try {
      const updates: any = {};
      if (newEmail) updates.email = newEmail;
      if (newPassword) updates.password = newPassword;
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      toast.success('Compte administrateur mis à jour');
      setNewEmail(''); setNewPassword(''); setSecurityCode('');
    } catch (e: any) { toast.error(e.message || 'Erreur'); }
    finally { setAccountSaving(false); }
  };

  if (loading) return <div className="animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-muted rounded-xl" />)}</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Paramètres</h1>
          <p className="text-sm text-muted-foreground">Configuration générale du site</p>
        </div>
        <button onClick={handleSaveSettings} disabled={saving} className="neu-btn-primary flex items-center gap-2 px-4 py-2.5 text-sm">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Sauvegarder
        </button>
      </div>

      {/* ── Site images management ── */}
      <div className="neu-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <ImageIcon className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-base">Images du site</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Remplacez les images du hero, des magasins et des pages publiques directement depuis ici.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SITE_IMAGE_SLOTS.map(slot => (
            <SiteImageSlot
              key={slot.key}
              slotKey={slot.key}
              label={slot.label}
              hint={slot.hint}
              aspect={slot.aspect}
              currentUrl={settings[slot.key] || ''}
              onUploaded={(key, url) => setSettings(prev => ({ ...prev, [key]: url }))}
            />
          ))}
        </div>
      </div>

      {SETTING_GROUPS.map(group => (
        <div key={group.title} className="neu-card p-6">
          <h2 className="font-bold mb-4 text-base">{group.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {group.settings.map(s => (
              <div key={s.key} className={s.type === 'textarea' ? 'sm:col-span-2' : ''}>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">{s.label}</label>
                {s.type === 'textarea' ? (
                  <textarea value={settings[s.key] || ''} onChange={e => setSettings(prev => ({ ...prev, [s.key]: e.target.value }))} rows={2} className="neu-input text-sm resize-none" />
                ) : (
                  <input type={s.type} value={settings[s.key] || ''} onChange={e => setSettings(prev => ({ ...prev, [s.key]: e.target.value }))} className="neu-input text-sm" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* ── Admin account change ── */}
      <div className="neu-card p-6 border-2 border-accent/20">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-accent" />
          <h2 className="font-bold text-base">Modifier le compte administrateur</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Cette action nécessite le code de sécurité. Compte actuel: <strong>{user?.email}</strong>
        </p>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Code de sécurité *</label>
            <div className="relative">
              <input type={showSecCode ? 'text' : 'password'} value={securityCode} onChange={e => setSecurityCode(e.target.value)}
                placeholder="Entrez le code de sécurité" className="neu-input text-sm pr-10" />
              <button type="button" onClick={() => setShowSecCode(!showSecCode)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showSecCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Nouvel email (optionnel)</label>
            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="nouveau@email.com" className="neu-input text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Nouveau mot de passe (optionnel)</label>
            <div className="relative">
              <input type={showNewPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="Nouveau mot de passe" className="neu-input text-sm pr-10" />
              <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button onClick={handleAccountChange} disabled={accountSaving}
            className="neu-btn-accent flex items-center gap-2 px-4 py-2.5 text-sm w-full justify-center">
            {accountSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            Modifier le compte admin
          </button>
        </div>
      </div>
    </div>
  );
}
