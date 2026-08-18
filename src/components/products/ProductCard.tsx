import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Zap } from 'lucide-react';
import { formatPrice, getPrimaryImage, getDiscountPercent } from '@/lib/utils';
import type { Product } from '@/types/types';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className = '' }: ProductCardProps) {
  const image = getPrimaryImage(product.product_images);
  const isOnSale = product.promotional_price !== null && product.promotional_price < product.price;
  const discount = isOnSale ? getDiscountPercent(product.price, product.promotional_price!) : 0;
  const outOfStock = product.stock === 0;

  return (
    <Link to={`/products/${product.slug}`} className={`product-card block group ${className}`}>
      {/* Image */}
      <div className="relative overflow-hidden rounded-t-xl">
        <img src={image} alt={product.name} className="product-card-img w-full"
          loading="lazy" style={{ height: '200px', objectFit: 'cover' }} />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_new && <span className="badge-new flex items-center gap-1"><Zap className="w-3 h-3" />Nouveau</span>}
          {isOnSale && <span className="badge-promo">-{discount}%</span>}
          {outOfStock && <span className="badge-sold-out">Rupture</span>}
          {product.is_featured && !product.is_new && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary text-primary-foreground flex items-center gap-1">
              <Star className="w-3 h-3" />Top
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
          {product.brands?.name}
        </div>
        <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-between">
          <div>
            {isOnSale ? (
              <div className="flex flex-col">
                <span className="price-promo text-base">{formatPrice(product.promotional_price!)}</span>
                <span className="price-original text-xs">{formatPrice(product.price)}</span>
              </div>
            ) : (
              <span className="price-tag text-base">{formatPrice(product.price)}</span>
            )}
          </div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${outOfStock ? 'bg-muted text-muted-foreground' : 'bg-primary text-white group-hover:bg-accent'}`}>
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        {!outOfStock && (
          <div className="mt-2 text-xs text-green-600 font-medium">En stock ({product.stock})</div>
        )}
      </div>
    </Link>
  );
}
