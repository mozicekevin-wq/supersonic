import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Megaphone, Calendar, ChevronRight, ArrowLeft } from 'lucide-react';
import { getPublishedPublications, getPublicationById } from '@/services/publications';
import { formatDate, truncate } from '@/lib/utils';
import type { Publication } from '@/types/types';

const TYPE_LABELS: Record<string, string> = {
  news: 'Actualité', promotion: 'Promotion', announcement: 'Annonce',
  event: 'Événement', special_offer: 'Offre spéciale', commercial: 'Commercial',
};
const TYPE_COLORS: Record<string, string> = {
  news: 'bg-blue-100 text-blue-700', promotion: 'bg-red-100 text-red-700',
  announcement: 'bg-purple-100 text-purple-700', event: 'bg-green-100 text-green-700',
  special_offer: 'bg-orange-100 text-orange-700', commercial: 'bg-gray-100 text-gray-700',
};

function PublicationDetail({ id }: { id: string }) {
  const [pub, setPub] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicationById(id).then(setPub).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse space-y-4">
    {[...Array(4)].map((_, i) => <div key={i} className="h-5 bg-muted rounded" />)}
  </div>;

  if (!pub) return <div className="text-center py-20 text-muted-foreground">Publication introuvable</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/publications" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour aux actualités
        </Link>
        {pub.image_url && (
          <img src={pub.image_url} alt={pub.title} className="w-full h-64 md:h-80 object-cover rounded-2xl mb-6" />
        )}
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_COLORS[pub.type] || 'bg-muted text-muted-foreground'}`}>
            {TYPE_LABELS[pub.type] || pub.type}
          </span>
          {pub.published_at && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" /> {formatDate(pub.published_at)}
            </div>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-balance">{pub.title}</h1>
        {pub.content ? (
          <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: pub.content }} />
        ) : pub.excerpt ? (
          <p className="text-muted-foreground leading-relaxed">{pub.excerpt}</p>
        ) : null}
      </div>
    </div>
  );
}

export default function PublicationsPage() {
  const { id } = useParams<{ id?: string }>();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PAGE_SIZE = 9;

  useEffect(() => {
    if (id) return;
    getPublishedPublications(PAGE_SIZE, page)
      .then(({ data, count }) => { setPublications(data); setTotal(count); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [id, page]);

  if (id) return <PublicationDetail id={id} />;

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary py-10 px-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Megaphone className="w-7 h-7 text-white" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Actualités & Publications</h1>
            <p className="text-white/70 text-sm">Nouveautés, promotions, événements et informations</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(PAGE_SIZE).fill(0).map((_, i) => (
              <div key={i} className="neu-card overflow-hidden animate-pulse">
                <div className="h-44 bg-muted rounded-t-xl" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-muted rounded w-1/4" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : publications.length === 0 ? (
          <div className="text-center py-20">
            <Megaphone className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucune publication</h2>
            <p className="text-muted-foreground">Revenez bientôt pour nos actualités</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publications.map(pub => (
                <Link key={pub.id} to={`/publications/${pub.id}`} className="neu-card overflow-hidden group">
                  {pub.image_url ? (
                    <div className="overflow-hidden rounded-t-xl">
                      <img src={pub.image_url} alt={pub.title}
                        className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  ) : (
                    <div className="h-20 bg-primary/10 rounded-t-xl flex items-center justify-center">
                      <Megaphone className="w-8 h-8 text-primary/40" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[pub.type] || 'bg-muted text-muted-foreground'}`}>
                        {TYPE_LABELS[pub.type] || pub.type}
                      </span>
                      {pub.published_at && (
                        <span className="text-xs text-muted-foreground">{formatDate(pub.published_at)}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">{pub.title}</h3>
                    {pub.excerpt && <p className="text-xs text-muted-foreground line-clamp-2">{pub.excerpt}</p>}
                    <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary">
                      Lire la suite <ChevronRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {total > PAGE_SIZE && (
              <div className="flex justify-center gap-2 mt-8">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="neu-btn px-4 py-2 text-sm disabled:opacity-40">Précédent</button>
                <span className="text-sm px-4 py-2 font-medium">Page {page}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={publications.length < PAGE_SIZE}
                  className="neu-btn px-4 py-2 text-sm disabled:opacity-40">Suivant</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
