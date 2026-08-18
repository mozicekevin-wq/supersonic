import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { getStores } from '@/services/admin';
import type { Store } from '@/types/types';

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStores().then(setStores).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Nos Magasins</h1>
          <p className="text-white/70">Retrouvez-nous à Brazzaville et Pointe-Noire, Congo</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[0, 1].map(i => (
              <div key={i} className="neu-card p-6 animate-pulse space-y-3">
                <div className="h-6 bg-muted rounded w-1/2" />
                {[...Array(4)].map((_, j) => <div key={j} className="h-4 bg-muted rounded" />)}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stores.map(store => (
                <div key={store.id} className="neu-card p-6">
                  <div className="flex items-start gap-3 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-primary">{store.name}</h2>
                      <div className="text-sm text-muted-foreground">{store.city}, République du Congo</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {store.address && (
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{store.address}</span>
                      </div>
                    )}
                    {store.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-accent flex-shrink-0" />
                        <div className="text-muted-foreground">
                          <a href={`tel:${store.phone}`} className="hover:text-primary transition-colors">{store.phone}</a>
                          {store.phone2 && <> / <a href={`tel:${store.phone2}`} className="hover:text-primary transition-colors">{store.phone2}</a></>}
                        </div>
                      </div>
                    )}
                    {store.email && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                        <a href={`mailto:${store.email}`} className="text-muted-foreground hover:text-primary transition-colors">{store.email}</a>
                      </div>
                    )}
                    {store.opening_hours && (
                      <div className="flex items-start gap-3 text-sm">
                        <Clock className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{store.opening_hours}</span>
                      </div>
                    )}
                  </div>
                  {store.latitude && store.longitude && (
                    <div className="mt-5 rounded-xl overflow-hidden border border-border">
                      <iframe
                        width="100%" height="220" frameBorder="0" style={{ border: 0 }}
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyB_LJOYJL-84SMuxNB7LtRGhxEQLjswvy0&q=${store.latitude},${store.longitude}&language=fr&region=cg&zoom=15`}
                        allowFullScreen />
                    </div>
                  )}
                  <a href={`https://wa.me/242069999999?text=Bonjour, je voudrais visiter votre magasin de ${store.city}`}
                    target="_blank" rel="noreferrer"
                    className="mt-4 w-full py-2.5 rounded-xl bg-green-500 text-white font-semibold flex items-center justify-center gap-2 text-sm hover:bg-green-600 transition-colors">
                    <Phone className="w-4 h-4" /> Contacter ce magasin
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
