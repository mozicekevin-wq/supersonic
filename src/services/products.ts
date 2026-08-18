import { supabase } from '@/db/supabase';
import type { Product, ProductFilters, PaginationParams } from '@/types/types';

const PAGE_SIZE = 12;

export async function getProducts(
  filters: ProductFilters = {},
  pagination: PaginationParams = { page: 1, pageSize: PAGE_SIZE }
) {
  const { page, pageSize } = pagination;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('products')
    .select(`
      *,
      categories!category_id(id,name,slug),
      brands!brand_id(id,name,slug,logo_url),
      product_images!product_id(id,url,alt_text,sort_order,is_primary)
    `, { count: 'exact' })
    .eq('is_published', true)
    .range(from, to);

  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }
  if (filters.category_id) query = query.eq('category_id', filters.category_id);
  if (filters.brand_id) query = query.eq('brand_id', filters.brand_id);
  if (filters.min_price !== undefined) query = query.gte('price', filters.min_price);
  if (filters.max_price !== undefined) query = query.lte('price', filters.max_price);
  if (filters.in_stock) query = query.gt('stock', 0);
  if (filters.is_promotion) query = query.not('promotional_price', 'is', null);

  switch (filters.sort) {
    case 'price_asc': query = query.order('price', { ascending: true }); break;
    case 'price_desc': query = query.order('price', { ascending: false }); break;
    case 'newest': query = query.order('created_at', { ascending: false }); break;
    case 'popular': query = query.order('view_count', { ascending: false }); break;
    default: query = query.order('created_at', { ascending: false });
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: Array.isArray(data) ? (data as Product[]) : [], count: count ?? 0 };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories!category_id(id,name,slug),
      brands!brand_id(id,name,slug,logo_url),
      product_images!product_id(id,url,alt_text,sort_order,is_primary)
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (error) throw error;
  return data as Product | null;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`*, categories!category_id(id,name,slug), brands!brand_id(id,name,slug), product_images!product_id(id,url,is_primary,sort_order)`)
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return Array.isArray(data) ? (data as Product[]) : [];
}

export async function getNewProducts(limit = 8): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`*, categories!category_id(id,name,slug), brands!brand_id(id,name,slug), product_images!product_id(id,url,is_primary,sort_order)`)
    .eq('is_published', true)
    .eq('is_new', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return Array.isArray(data) ? (data as Product[]) : [];
}

export async function getSimilarProducts(productId: string, categoryId: string | null, limit = 4): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select(`*, categories!category_id(id,name,slug), brands!brand_id(id,name,slug), product_images!product_id(id,url,is_primary,sort_order)`)
    .eq('is_published', true)
    .neq('id', productId)
    .order('view_count', { ascending: false })
    .limit(limit);
  if (categoryId) query = query.eq('category_id', categoryId);
  const { data, error } = await query;
  if (error) throw error;
  return Array.isArray(data) ? (data as Product[]) : [];
}

export async function incrementProductView(productId: string) {
  try {
    await supabase.rpc('increment_view_count' as never, { pid: productId } as never);
  } catch {
    // Fallback direct update
    const { data: p } = await supabase.from('products').select('view_count').eq('id', productId).maybeSingle();
    if (p) await supabase.from('products').update({ view_count: (p as any).view_count + 1 }).eq('id', productId);
  }
}

// Admin
export async function getAllProductsAdmin(page = 1, pageSize = 20, search = '') {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = supabase
    .from('products')
    .select(`*, categories!category_id(id,name), brands!brand_id(id,name), product_images!product_id(id,url,is_primary,sort_order)`, { count: 'exact' })
    .range(from, to)
    .order('created_at', { ascending: false });
  if (search) query = query.ilike('name', `%${search}%`);
  const { data, error, count } = await query;
  if (error) throw error;
  return { data: Array.isArray(data) ? (data as Product[]) : [], count: count ?? 0 };
}

export async function createProduct(product: Partial<Product>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(product as never)
    .select('*')
    .single();
  if (error) throw error;
  return data as Product;
}

export async function updateProduct(id: string, updates: Partial<Product>) {
  const { error } = await supabase.from('products').update(updates as never).eq('id', id);
  if (error) throw error;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function addProductImage(productId: string, url: string, isPrimary = false) {
  const { error } = await supabase.from('product_images').insert({ product_id: productId, url, is_primary: isPrimary } as never);
  if (error) throw error;
}

export async function deleteProductImage(imageId: string) {
  const { error } = await supabase.from('product_images').delete().eq('id', imageId);
  if (error) throw error;
}

export async function uploadProductImage(file: File, productId: string): Promise<string> {
  const ext = file.name.split('.').pop();
  const fileName = `${productId}/${Date.now()}.${ext}`;
  const { data, error } = await supabase.storage.from('products').upload(fileName, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('products').getPublicUrl(data.path);
  return urlData.publicUrl;
}
