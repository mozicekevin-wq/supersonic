import { useState, useEffect } from 'react';
import { Pencil, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getProfiles, updateUserRole } from '@/services/admin';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateShort } from '@/lib/utils';

const ROLES = ['user', 'editor', 'admin'];
const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-primary/10 text-primary', editor: 'bg-purple-100 text-purple-700', user: 'bg-muted text-muted-foreground',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { profile: me } = useAuth();

  const load = async () => {
    setLoading(true);
    try { setUsers(await getProfiles()); }
    catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleRoleChange = async (userId: string, role: string) => {
    if (userId === me?.id) { toast.error('Vous ne pouvez pas modifier votre propre rôle'); return; }
    setUpdatingId(userId);
    try { await updateUserRole(userId, role); toast.success('Rôle mis à jour'); load(); }
    catch { toast.error('Erreur'); }
    finally { setUpdatingId(null); }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Gestion des utilisateurs</h1>
        <p className="text-sm text-muted-foreground">{users.length} utilisateur{users.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="neu-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                {['Utilisateur', 'Email', 'Téléphone', 'Rôle', 'Inscrit le', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array(5).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={6} className="py-3 px-4"><div className="h-10 bg-muted rounded animate-pulse" /></td></tr>
              )) : users.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Aucun utilisateur</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <div className="font-medium">{u.full_name || '—'}</div>
                    {u.id === me?.id && <span className="text-xs text-primary">(vous)</span>}
                  </td>
                  <td className="py-2.5 px-4 text-muted-foreground text-xs whitespace-nowrap">{u.email || '—'}</td>
                  <td className="py-2.5 px-4 text-muted-foreground text-xs whitespace-nowrap">{u.phone || '—'}</td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${ROLE_COLORS[u.role] || 'bg-muted'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-muted-foreground text-xs whitespace-nowrap">
                    {formatDateShort(u.created_at)}
                  </td>
                  <td className="py-2.5 px-4 whitespace-nowrap">
                    {u.id !== me?.id && (
                      <div className="flex items-center gap-2">
                        {updatingId === u.id ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : (
                          <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}
                            className="text-xs border border-border rounded-lg px-2 py-1 bg-background">
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
