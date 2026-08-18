import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingBag, Phone, MessageCircle, Shield, Package, Star, ChevronRight } from 'lucide-react';
import { getProductBySlug, getSimilarProducts } from '@/services/products';
import { formatPrice, getPrimaryImage } from '@/lib/utils';
import ProductCard from '@/components/products/ProductCard';
import OrderModal from '@/components/products/OrderModal';
import type { Product } from '@/types/types';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [orderOpen, setOrderOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getProductBySlug(slug).then(p => {
      if (!p) { navigate('/products', { replace: true }); return; }
      setProduct(p);
      setSelectedImage(0);
      getSimilarProducts(p.id, p.category_id, 4).then(setSimilar).catch(() => {});
    }).catch(() => navigate('/products', { replace: true }))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto animate-pulse">
          <div className="h-6 bg-muted rounded w-48 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-muted rounded-2xl h-80" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <div key={i} className={`h-5 bg-muted rounded w-${['full','3/4','1/2','full','2/3'][i]}`} />)}
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!product) return null;

  const images = product.product_images?.sort((a, b) => a.sort_order - b.sort_order) || [];
  const currentImage = images[selectedImage]?.url || getPrimaryImage(images);
  const isOnSale = product.promotional_price !== null && product.promotional_price < product.price;
  const activePrice = isOnSale ? product.promotional_price! : product.price;
  const discount = isOnSale ? Math.round(((product.price - product.promotional_price!) / product.price) * 100) : 0;
  const outOfStock = product.stock === 0;

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Bonjour Supersonic! Je suis intéressé par: ${product.name} (Réf: ${product.slug}). Prix: ${formatPrice(activePrice)}. Pouvez-vous me donner plus d'informations?`);
    window.open(`https://wa.me/242069999999?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted border-b border-border px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/products" className="hover:text-primary transition-colors">Produits</Link>
          {product.categories && <>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/products?category=${product.categories.slug}`} className="hover:text-primary transition-colors">
              {product.categories.name}
            </Link>
          </>}
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Image gallery */}
          <div className="space-y-3">
            <div className="neu-card overflow-hidden rounded-2xl p-2">
              <img src={currentImage} alt={product.name}
                className="w-full h-72 md:h-96 object-cover rounded-xl" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={img.id} onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === selectedImage ? 'border-primary' : 'border-transparent neu-flat'}`}>
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.is_new && <span className="badge-new">Nouveau</span>}
              {isOnSale && <span className="badge-promo">-{discount}%</span>}
              {outOfStock && <span className="badge-sold-out">Rupture de stock</span>}
              {product.categories && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {product.categories.name}
                </span>
              )}
            </div>

            {/* Brand */}
            {product.brands && (
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {product.brands.name}
              </div>
            )}

            {/* Name */}
            <h1 className="text-2xl md:text-3xl font-bold text-foreground text-balance">{product.name}</h1>

            {/* Price */}
            <div className="neu-pressed rounded-xl p-4">
              {isOnSale ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-accent">{formatPrice(product.promotional_price!)}</span>
                  <span className="text-lg line-through text-muted-foreground">{formatPrice(product.price)}</span>
                  <span className="text-sm font-bold text-white bg-accent px-2 py-0.5 rounded">-{discount}%</span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
              )}
            </div>

            {/* Stock */}
            <div className={`flex items-center gap-2 text-sm font-medium ${outOfStock ? 'text-destructive' : 'text-green-600'}`}>
              <div className={`w-2 h-2 rounded-full ${outOfStock ? 'bg-destructive' : 'bg-green-500'}`} />
              {outOfStock ? 'Rupture de stock' : `En stock (${product.stock} disponible${product.stock > 1 ? 's' : ''})`}
            </div>

            {/* Warranty */}
            {product.warranty && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4 text-primary" /> Garantie: {product.warranty}
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setOrderOpen(true)} disabled={outOfStock}
                className="neu-btn-primary flex-1 flex items-center justify-center gap-2 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed">
                <ShoppingBag className="w-5 h-5" />
                {outOfStock ? 'Indisponible' : 'Commander'}
              </button>
              <button onClick={handleWhatsApp}
                className="flex-1 py-3 rounded-xl bg-green-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-green-600 transition-colors text-base">
                <MessageCircle className="w-5 h-5" /> Contacter Supersonic
              </button>
            </div>
            <a href="tel:+242069999999"
              className="w-full py-2.5 rounded-xl border border-border text-center text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary transition-colors flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" /> Appeler: +242 06 xxx xx xx
            </a>
          </div>
        </div>

        {/* Tabs: Description & Specs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Description */}
          {product.description && (
            <div className="neu-card p-6">
              <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" /> Description
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Technical specs */}
          {product.technical_specs && product.technical_specs.length > 0 && (
            <div className="neu-card p-6">
              <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" /> Caractéristiques
              </h2>
              <dl className="space-y-2">
                {product.technical_specs.map((spec, i) => (
                  <div key={i} className={`flex justify-between py-2 text-sm ${i % 2 === 0 ? '' : 'bg-muted/50 rounded px-2'}`}>
                    <dt className="font-medium text-muted-foreground">{spec.label}</dt>
                    <dd className="font-semibold text-right">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        {/* Similar products */}
        {similar.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="section-title">Produits similaires</h2>
              <Link to="/products" className="text-sm font-semibold text-primary flex items-center gap-1">
                Voir plus <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {similar.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      {product && <OrderModal product={product} open={orderOpen} onClose={() => setOrderOpen(false)} />}
    </div>
  );
}
