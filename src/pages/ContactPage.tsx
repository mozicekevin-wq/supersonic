import { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/db/supabase';
import { toast } from 'sonner';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message) { toast.error('Veuillez remplir les champs obligatoires'); return; }
    setLoading(true);
    try {
      const { error } = await supabase.from('contacts').insert(form as never);
      if (error) throw error;
      toast.success('Message envoyé! Nous vous répondrons bientôt.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch { toast.error('Erreur lors de l\'envoi. Réessayez.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Nous Contacter</h1>
          <p className="text-white/70">Notre équipe est disponible pour vous aider</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Info */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold mb-4">Informations de contact</h2>
            <div className="space-y-4">
              {[
                { icon: Phone, label: 'Téléphone', value: '+242 06 xxx xx xx', href: 'tel:+242069999999' },
                { icon: Mail, label: 'Email', value: 'contact@supersonic-congo.com', href: 'mailto:contact@supersonic-congo.com' },
                { icon: MapPin, label: 'Adresses', value: 'Pointe-Noire & Brazzaville, Congo', href: '/stores' },
              ].map(item => (
                <a key={item.label} href={item.href}
                  className="neu-flat flex items-center gap-4 p-4 rounded-xl hover:border-primary/30 transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                    <item.icon className="w-5 h-5 text-primary group-hover:text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                    <div className="font-medium text-sm">{item.value}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
          <a href="https://wa.me/242069999999" target="_blank" rel="noreferrer"
            className="w-full py-3 rounded-xl bg-green-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors">
            <MessageCircle className="w-5 h-5" /> Contacter sur WhatsApp
          </a>
          <div className="neu-card p-5">
            <h3 className="font-semibold mb-3">Horaires d'ouverture</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex justify-between"><span>Lundi - Samedi</span><span className="font-medium text-foreground">8h00 - 19h00</span></div>
              <div className="flex justify-between"><span>Dimanche</span><span className="font-medium text-foreground">9h00 - 14h00</span></div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div>
          <h2 className="text-xl font-bold mb-4">Envoyer un message</h2>
          <form onSubmit={handleSubmit} className="neu-card p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Nom *</label>
                <input name="name" value={form.name} onChange={handleChange} required placeholder="Votre nom" className="neu-input text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Téléphone</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+242 ..." className="neu-input text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Email</label>
              <input name="email" value={form.email} onChange={handleChange} type="email" placeholder="votre@email.com" className="neu-input text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Sujet</label>
              <input name="subject" value={form.subject} onChange={handleChange} placeholder="Objet de votre message" className="neu-input text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Message *</label>
              <textarea name="message" value={form.message} onChange={handleChange} required rows={5}
                placeholder="Votre message..." className="neu-input text-sm resize-none" />
            </div>
            <button type="submit" disabled={loading}
              className="neu-btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {loading ? 'Envoi en cours...' : 'Envoyer le message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
