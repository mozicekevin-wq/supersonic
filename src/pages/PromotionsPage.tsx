import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Clock, ArrowRight } from 'lucide-react';
import { getActivePromotions } from '@/services/promotions';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Promotion } from '@/types/types';

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActivePromotions(50).then(setPromotions).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-accent py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Tag className="w-7 h-7 text-white" />
            <h1 className="text-2xl md:text-3xl font-bold text-white">Promotions en cours</h1>
          </div>
          <p className="text-white/80">Profitez de nos meilleures offres avant qu'elles expirent!</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="neu-card overflow-hidden animate-pulse">
                <div className="h-52 bg-muted rounded-t-xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-5 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-20">
            <Tag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucune promotion en cours</h2>
            <p className="text-muted-foreground mb-6">Revenez bientôt pour découvrir nos offres</p>
            <Link to="/products" className="neu-btn-primary px-6 py-3 inline-flex items-center gap-2">
              Voir nos produits <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotions.map(promo => {
              const daysLeft = Math.ceil((new Date(promo.end_date).getTime() - Date.now()) / 86400000);
              return (
                <div key={promo.id} className="neu-card overflow-hidden group">
                  {promo.image_url && (
                    <div className="relative overflow-hidden rounded-t-xl">
                      <img src={promo.image_url} alt={promo.title}
                        className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute top-3 right-3 bg-accent text-white font-bold text-lg px-3 py-1 rounded-xl shadow-lg">
                        -{Math.round(promo.discount_percentage)}%
                      </div>
                      {daysLeft <= 7 && (
                        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/70 text-white text-xs px-2 py-1 rounded-lg">
                          <Clock className="w-3 h-3" />
                          {daysLeft <= 1 ? 'Expire aujourd\'hui!' : `${daysLeft} jours restants`}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-bold text-base mb-1 line-clamp-2 group-hover:text-primary transition-colors">{promo.title}</h3>
                    {promo.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{promo.description}</p>}
                    <div className="flex items-baseline gap-3 mb-3">
                      <span className="text-2xl font-bold text-accent">{formatPrice(promo.promotional_price)}</span>
                      <span className="text-sm line-through text-muted-foreground">{formatPrice(promo.original_price)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Expire le {formatDate(promo.end_date)}
                    </div>
                    {promo.products?.slug && (
                      <Link to={`/products/${promo.products.slug}`}
                        className="neu-btn-accent w-full flex items-center justify-center gap-2 py-2.5 text-sm">
                        <Tag className="w-4 h-4" /> Voir le produit
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
