import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const LOGO_URL = 'https://miaoda-conversation-file.s3cdn.medo.dev/user-dg06phmgr9c0/app-dsazr1cm25tt/20260817/file_00000000971482438d70a20248281418.png';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Veuillez remplir tous les champs'); return; }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) { toast.error(error || 'Identifiants incorrects'); return; }
    toast.success('Connexion réussie');
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'hsl(var(--sidebar-background))' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={LOGO_URL} alt="Supersonic" className="h-12 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white">Espace Administration</h1>
          <p className="text-white/60 text-sm mt-1">Connectez-vous pour accéder au tableau de bord</p>
        </div>

        <form onSubmit={handleSubmit} className="neu-flat rounded-2xl p-6 space-y-4 bg-white/5 border-white/10">
          <div>
            <label className="text-xs font-medium text-white/60 mb-1.5 block">Adresse email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="admin@supersonic.com"
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 outline-none focus:border-accent text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-white/60 mb-1.5 block">Mot de passe</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••••"
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/30 outline-none focus:border-accent text-sm" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 text-white transition-all"
            style={{ background: 'var(--gradient-accent)' }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className="text-center mt-6">
          <a href="/" className="text-sm text-white/40 hover:text-white/70 transition-colors">← Retour au site</a>
        </div>
      </div>
    </div>
  );
}
