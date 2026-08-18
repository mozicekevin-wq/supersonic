import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getProducts } from '@/services/products';
import { getCategories, getBrands } from '@/services/categories';
import ProductCard from '@/components/products/ProductCard';
import ProductCardSkeleton from '@/components/products/ProductCardSkeleton';
import type { Product, Category, Brand, ProductFilters } from '@/types/types';

const PAGE_SIZE = 12;
const SORT_OPTIONS = [
  { value: 'newest', label: 'Plus récents' },
  { value: 'popular', label: 'Populaires' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter state from URL params
  const [filters, setFilters] = useState<ProductFilters>({
    search: searchParams.get('search') || '',
    category_id: '',
    brand_id: '',
    min_price: undefined,
    max_price: undefined,
    in_stock: false,
    is_promotion: false,
    sort: 'newest',
  });

  // Load metadata
  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
    getBrands().then(setBrands).catch(() => {});
  }, []);

  // Resolve category slug→id from URL
  useEffect(() => {
    const catSlug = searchParams.get('category');
    const brandSlug = searchParams.get('brand');
    setFilters(f => ({
      ...f,
      search: searchParams.get('search') || f.search,
      category_id: catSlug ? (categories.find(c => c.slug === catSlug)?.id || '') : f.category_id,
      brand_id: brandSlug ? (brands.find(b => b.slug === brandSlug)?.id || '') : f.brand_id,
    }));
    setPage(1);
  }, [searchParams, categories, brands]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, count } = await getProducts(filters, { page, pageSize: PAGE_SIZE });
      setProducts(data);
      setTotal(count);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setFilters(f => ({ ...f, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', category_id: '', brand_id: '', min_price: undefined, max_price: undefined, in_stock: false, is_promotion: false, sort: 'newest' });
    setSearchParams({});
    setPage(1);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasFilters = !!(filters.search || filters.category_id || filters.brand_id || filters.in_stock || filters.is_promotion || filters.min_price || filters.max_price);

  const FilterPanel = () => (
    <div className="space-y-5">
      {/* Search */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Rechercher</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={filters.search || ''} onChange={e => handleFilterChange('search', e.target.value)}
            placeholder="Nom du produit..." className="neu-input pl-9 text-sm" />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Catégorie</label>
        <select value={filters.category_id || ''} onChange={e => handleFilterChange('category_id', e.target.value)} className="neu-input text-sm">
          <option value="">Toutes les catégories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Brand */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Marque</label>
        <select value={filters.brand_id || ''} onChange={e => handleFilterChange('brand_id', e.target.value)} className="neu-input text-sm">
          <option value="">Toutes les marques</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* Price */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Prix (FCFA)</label>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={filters.min_price || ''} onChange={e => handleFilterChange('min_price', e.target.value ? Number(e.target.value) : undefined)} className="neu-input text-sm" />
          <input type="number" placeholder="Max" value={filters.max_price || ''} onChange={e => handleFilterChange('max_price', e.target.value ? Number(e.target.value) : undefined)} className="neu-input text-sm" />
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={filters.in_stock || false} onChange={e => handleFilterChange('in_stock', e.target.checked)} className="w-4 h-4 accent-primary" />
          <span className="text-sm">En stock uniquement</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={filters.is_promotion || false} onChange={e => handleFilterChange('is_promotion', e.target.checked)} className="w-4 h-4 accent-primary" />
          <span className="text-sm">En promotion</span>
        </label>
      </div>

      {hasFilters && (
        <button onClick={clearFilters} className="w-full text-sm text-accent font-medium flex items-center justify-center gap-1 py-2 rounded-lg hover:bg-accent/10 transition-colors">
          <X className="w-4 h-4" /> Effacer les filtres
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Notre Catalogue</h1>
          <p className="text-white/70">Électronique • Électroménager • Informatique • Mobilier • Bureautique</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Desktop sidebar filters */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="neu-card p-5 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-sm uppercase tracking-wider">Filtres</h2>
                {hasFilters && <span className="text-xs text-accent font-semibold">Actifs</span>}
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 gap-3">
              <div className="text-sm text-muted-foreground">
                {loading ? 'Chargement...' : `${total} produit${total !== 1 ? 's' : ''}`}
              </div>
              <div className="flex items-center gap-2">
                <select value={filters.sort || 'newest'} onChange={e => handleFilterChange('sort', e.target.value as any)}
                  className="neu-input text-sm py-2 w-auto">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <button onClick={() => setFiltersOpen(!filtersOpen)} className="md:hidden neu-btn py-2 px-3 flex items-center gap-1 text-sm">
                  <SlidersHorizontal className="w-4 h-4" /> Filtres
                </button>
              </div>
            </div>

            {/* Mobile filters drawer */}
            {filtersOpen && (
              <div className="md:hidden neu-card p-4 mb-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-sm">Filtres</h2>
                  <button onClick={() => setFiltersOpen(false)}><X className="w-4 h-4" /></button>
                </div>
                <FilterPanel />
              </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {loading ? Array(PAGE_SIZE).fill(0).map((_, i) => <ProductCardSkeleton key={i} />) :
                products.length === 0 ? (
                  <div className="col-span-full text-center py-16">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold mb-2">Aucun produit trouvé</h3>
                    <p className="text-muted-foreground text-sm mb-4">Essayez de modifier vos filtres</p>
                    <button onClick={clearFilters} className="neu-btn-primary px-5 py-2.5 text-sm">Effacer les filtres</button>
                  </div>
                ) : products.map(p => <ProductCard key={p.id} product={p} />)
              }
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="neu-btn p-2 disabled:opacity-40">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium px-4 py-2">Page {page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="neu-btn p-2 disabled:opacity-40">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
