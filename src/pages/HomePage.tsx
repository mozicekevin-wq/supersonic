import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Tag, Zap, Phone, MapPin, ChevronRight, ChevronLeft } from 'lucide-react';
import { getFeaturedProducts, getNewProducts } from '@/services/products';
import { getActivePromotions } from '@/services/promotions';
import { getCategories, getBrands } from '@/services/categories';
import { getPublishedPublications } from '@/services/publications';
import { getStores } from '@/services/admin';
import ProductCard from '@/components/products/ProductCard';
import ProductCardSkeleton from '@/components/products/ProductCardSkeleton';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Product, Promotion, Category, Brand, Publication, Store } from '@/types/types';

const STORE_IMG = 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_b51f9e08-8c1a-49da-81e6-ba034eb634b0.jpg';

// Hero slider slides
const HERO_SLIDES = [
  {
    bg: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=1600&q=80',
    preview: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&q=80',
    tag: 'Électroménager Premium',
    title: 'Réfrigérateurs,\nave-linges,\nclimatiseurs',
    subtitle: 'Les meilleures marques au meilleur prix au Congo',
  },
  {
    bg: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1600&q=80',
    preview: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80',
    tag: 'Informatique & High-Tech',
    title: 'Ordinateurs,\nTablettes &\nAccessoires',
    subtitle: 'Équipez-vous avec les dernières technologies',
  },
  {
    bg: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1600&q=80',
    preview: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
    tag: 'Mobilier & Bureau',
    title: 'Canapés,\nBureaux &\nMobilier design',
    subtitle: 'Transformez votre espace de vie et de travail',
  },
];

const CATEGORY_ICONS: Record<string, string> = {
  electronique: '📱', electromenager: '🏠', mobilier: '🪑',
  informatique: '💻', bureautique: '🖨️',
};

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  // Hero slider state
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroFading, setHeroFading] = useState(false);
  const heroTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goToSlide = useCallback((idx: number) => {
    setHeroFading(true);
    setTimeout(() => {
      setHeroIndex((idx + HERO_SLIDES.length) % HERO_SLIDES.length);
      setHeroFading(false);
    }, 350);
  }, []);

  const nextSlide = useCallback(() => goToSlide(heroIndex + 1), [heroIndex, goToSlide]);
  const prevSlide = useCallback(() => goToSlide(heroIndex - 1), [heroIndex, goToSlide]);

  // Auto-advance slider every 5 s
  useEffect(() => {
    heroTimerRef.current = setInterval(() => {
      setHeroIndex(i => (i + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => { if (heroTimerRef.current) clearInterval(heroTimerRef.current); };
  }, []);

  useEffect(() => {
    Promise.all([
      getFeaturedProducts(8),
      getNewProducts(8),
      getActivePromotions(4),
      getCategories(),
      getBrands(),
      getPublishedPublications(3),
      getStores(),
    ]).then(([feat, newP, promos, cats, brnds, pubs, strs]) => {
      setFeatured(feat); setNewProducts(newP); setPromotions(promos);
      setCategories(cats); setBrands(brnds);
      setPublications(pubs.data); setStores(strs);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const slide = HERO_SLIDES[heroIndex];

  return (
    <div className="min-h-screen">
      {/* ===== HERO SLIDER ===== */}
      <section className="relative h-[520px] md:h-[620px] overflow-hidden">
        {/* Background image with crossfade */}
        {HERO_SLIDES.map((s, i) => (
          <div key={i}
            className="absolute inset-0 bg-center bg-cover transition-opacity duration-700"
            style={{
              backgroundImage: `url(${s.bg})`,
              opacity: i === heroIndex ? 1 : 0,
              zIndex: 0,
            }}
          />
        ))}

        {/* Dark gradient overlay — stronger on left for text legibility */}
        <div className="absolute inset-0 z-10"
          style={{ background: 'linear-gradient(to right, rgba(15,20,50,0.92) 0%, rgba(15,20,50,0.75) 55%, rgba(15,20,50,0.25) 100%)' }} />

        {/* Content */}
        <div className={`relative z-20 h-full flex items-center px-4 md:px-10 transition-opacity duration-350 ${heroFading ? 'opacity-0' : 'opacity-100'}`}>
          <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-8">

            {/* Left: text */}
            <div className="flex-1 text-white">
              {/* Tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/80 border border-white/20 text-xs font-semibold mb-4 uppercase tracking-widest">
                <Zap className="w-3.5 h-3.5 text-yellow-300" />
                <span>{slide.tag}</span>
              </div>

              {/* Headline */}
              <div className="text-sm font-medium text-white/60 uppercase tracking-widest mb-2">
                SOCIÉTÉ SUPERSONIC — CONGO
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4 text-balance whitespace-pre-line">
                {slide.title}
              </h1>
              <p className="text-white/70 text-sm md:text-base mb-8 max-w-md text-pretty">
                {slide.subtitle}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <Link to="/products"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accent/90 transition-all hover:-translate-y-0.5 shadow-lg">
                  <ShoppingBag className="w-4 h-4" /> Découvrir
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/promotions"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-white/50 text-white font-semibold text-sm hover:bg-white/10 transition-colors">
                  <Tag className="w-4 h-4" /> Voir les promotions
                </Link>
              </div>

              {/* Slide dots */}
              <div className="flex items-center gap-2 mt-8">
                {HERO_SLIDES.map((_, i) => (
                  <button key={i} onClick={() => goToSlide(i)}
                    className={`rounded-full transition-all duration-300 ${i === heroIndex ? 'w-8 h-2.5 bg-accent' : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'}`}
                    aria-label={`Diapositive ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right: product preview card (visible on md+) */}
            <div className="hidden md:flex flex-col items-end gap-4 shrink-0">
              {/* Prev/Next arrows */}
              <div className="flex gap-2 mb-2">
                <button onClick={prevSlide}
                  className="w-10 h-10 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={nextSlide}
                  className="w-10 h-10 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              {/* Preview image card with neumorphic glow */}
              <div className={`relative rounded-2xl overflow-hidden transition-opacity duration-350 ${heroFading ? 'opacity-0' : 'opacity-100'}`}
                style={{
                  width: 280,
                  height: 220,
                  boxShadow: '0 0 0 4px rgba(255,255,255,0.12), 0 20px 60px rgba(0,0,0,0.5)',
                }}>
                <img src={slide.preview} alt={slide.tag}
                  className="w-full h-full object-cover" />
                <div className="absolute inset-0 rounded-2xl"
                  style={{ background: 'radial-gradient(ellipse at 50% 110%, rgba(255,255,255,0.18) 0%, transparent 70%)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile prev/next arrows on edges */}
        <button onClick={prevSlide}
          className="md:hidden absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={nextSlide}
          className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/40 border border-white/20 flex items-center justify-center text-white">
          <ChevronRight className="w-5 h-5" />
        </button>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="py-14 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="section-subtitle mb-2">Explorer par</div>
            <h2 className="section-title">Nos Catégories</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {loading ? Array(5).fill(0).map((_, i) => (
              <div key={i} className="neu-card p-6 text-center animate-pulse">
                <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-3" />
                <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
              </div>
            )) : categories.map(cat => (
              <Link key={cat.id} to={`/products?category=${cat.slug}`}
                className="neu-card p-6 text-center cursor-pointer group">
                <div className="text-3xl mb-3">{CATEGORY_ICONS[cat.slug] || '📦'}</div>
                <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </div>
                {cat.description && (
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{cat.description}</div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROMOTIONS ===== */}
      {promotions.length > 0 && (
        <section className="py-14 px-4" style={{ background: 'hsl(var(--muted))' }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="section-subtitle mb-2">Offres limitées</div>
                <h2 className="section-title">Promotions en cours</h2>
              </div>
              <Link to="/promotions" className="text-sm font-semibold text-primary flex items-center gap-1 hover:gap-2 transition-all">
                Voir tout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {promotions.map(promo => (
                <Link key={promo.id}
                  to={promo.products ? `/products/${promo.products.slug}` : '/promotions'}
                  className="neu-card overflow-hidden group">
                  <div className="relative overflow-hidden rounded-t-xl">
                    {promo.image_url && (
                      <img src={promo.image_url} alt={promo.title}
                        className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105" />
                    )}
                    <div className="absolute top-2 right-2 bg-accent text-white text-sm font-bold px-2 py-1 rounded-lg">
                      -{Math.round(promo.discount_percentage)}%
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">{promo.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="price-promo text-base">{formatPrice(promo.promotional_price)}</span>
                      <span className="price-original">{formatPrice(promo.original_price)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="py-14 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="section-subtitle mb-2">Les plus populaires</div>
              <h2 className="section-title">Produits à la une</h2>
            </div>
            <Link to="/products?featured=true" className="text-sm font-semibold text-primary flex items-center gap-1 hover:gap-2 transition-all">
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />) :
              featured.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </div>
      </section>

      {/* ===== NEW ARRIVALS ===== */}
      {(loading || newProducts.length > 0) && (
        <section className="py-14 px-4" style={{ background: 'hsl(var(--muted))' }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="section-subtitle mb-2">Tout juste arrivés</div>
                <h2 className="section-title">Nouveautés</h2>
              </div>
              <Link to="/products?new=true" className="text-sm font-semibold text-primary flex items-center gap-1 hover:gap-2 transition-all">
                Voir tout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading ? Array(4).fill(0).map((_, i) => <ProductCardSkeleton key={i} />) :
                newProducts.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)
              }
            </div>
          </div>
        </section>
      )}

      {/* ===== BRANDS ===== */}
      <section className="py-12 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="section-subtitle mb-2">Nos partenaires</div>
            <h2 className="section-title">Marques disponibles</h2>
          </div>
          <div className="neu-flat rounded-3xl p-4 sm:p-8 overflow-hidden">
            <img
              src="/supersonic/brand-logos-clean.png"
              alt="Logos partenaires : Apple, Dell, Epson, Hisense, HP, Lenovo, LG, Samsung, Sony, Westpool, Sharp et Canon"
              className="w-full h-auto object-contain"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section className="py-14 px-4 hero-gradient">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-white">
            <div className="text-accent text-sm font-semibold uppercase tracking-widest mb-2">Qui sommes-nous</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-balance">
              Société Supersonic, votre partenaire tech au Congo
            </h2>
            <p className="text-white/80 leading-relaxed mb-6 text-pretty">
              Depuis plus de 10 ans, Société Supersonic est le leader de la distribution de produits électroniques,
              électroménagers, mobiliers, informatiques et bureautiques au Congo. Nous proposons les meilleures marques
              mondiales avec un service client exceptionnel dans nos showrooms de Brazzaville et Pointe-Noire.
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { icon: '⚡', label: 'Livraison rapide', desc: 'Dans tout le Congo' },
                { icon: '🛡️', label: 'Garantie officielle', desc: 'Sur tous les produits' },
                { icon: '💯', label: 'Produits authentiques', desc: 'Marques certifiées' },
                { icon: '🎯', label: 'SAV disponible', desc: 'Support technique' },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <div className="font-semibold text-sm text-white">{item.label}</div>
                    <div className="text-xs text-white/60">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/products" className="neu-btn-accent inline-flex items-center gap-2 px-6 py-3">
              Découvrir nos produits <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex-1 max-w-md w-full">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img src={STORE_IMG} alt="Magasin Supersonic" className="w-full h-64 object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== PUBLICATIONS ===== */}
      {publications.length > 0 && (
        <section className="py-14 px-4 bg-background">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="section-subtitle mb-2">Restez informé</div>
                <h2 className="section-title">Actualités</h2>
              </div>
              <Link to="/publications" className="text-sm font-semibold text-primary flex items-center gap-1 hover:gap-2 transition-all">
                Voir tout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {publications.map(pub => (
                <Link key={pub.id} to={`/publications/${pub.id}`} className="neu-card overflow-hidden group">
                  {pub.image_url && (
                    <div className="overflow-hidden rounded-t-xl">
                      <img src={pub.image_url} alt={pub.title}
                        className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="text-xs text-muted-foreground mb-2">
                      {pub.published_at ? formatDate(pub.published_at) : ''}
                    </div>
                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">{pub.title}</h3>
                    {pub.excerpt && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{pub.excerpt}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== STORES ===== */}
      <section className="py-14 px-4" style={{ background: 'hsl(var(--muted))' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="section-subtitle mb-2">Nous trouver</div>
            <h2 className="section-title">Nos Magasins</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stores.map(store => (
              <div key={store.id} className="neu-card p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary">{store.name}</h3>
                    <div className="text-sm text-muted-foreground">{store.city}, Congo</div>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  {store.address && <div className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-accent shrink-0" />{store.address}</div>}
                  {store.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-accent shrink-0" />{store.phone}{store.phone2 && ` / ${store.phone2}`}</div>}
                  {store.opening_hours && <div className="flex items-start gap-2">🕐 <span>{store.opening_hours}</span></div>}
                </div>
                <Link to="/stores" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all">
                  Voir sur la carte <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link to="/stores" className="neu-btn-primary inline-flex items-center gap-2 px-6 py-3">
              Voir tous nos magasins <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CONTACT CTA ===== */}
      <section className="py-12 px-4 bg-background">
        <div className="max-w-2xl mx-auto text-center">
          <div className="section-subtitle mb-2">Besoin d'aide ?</div>
          <h2 className="section-title mb-4">Nous contacter</h2>
          <p className="text-muted-foreground mb-6 text-pretty">
            Notre équipe est disponible pour vous conseiller et répondre à toutes vos questions.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="https://wa.me/242069999999" target="_blank" rel="noreferrer"
              className="neu-btn-accent flex items-center gap-2 px-6 py-3">
              <Phone className="w-4 h-4" /> WhatsApp
            </a>
            <Link to="/contact" className="neu-btn flex items-center gap-2 px-6 py-3">
              Formulaire de contact
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
