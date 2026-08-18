import { supabase } from '@/db/supabase';
import type { Category, Brand } from '@/types/types';

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return Array.isArray(data) ? (data as Category[]) : [];
}

export async function getBrands(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return Array.isArray(data) ? (data as Brand[]) : [];
}

// Admin
export async function createCategory(cat: Partial<Category>): Promise<Category> {
  const { data, error } = await supabase.from('categories').insert(cat as never).select('*').single();
  if (error) throw error;
  return data as Category;
}

export async function uploadCategoryImage(file: File, categoryId: string): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `categories/${categoryId}-${Date.now()}.${ext}`;
  const { data, error } = await supabase.storage.from('brands').upload(fileName, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('brands').getPublicUrl(data.path);
  return urlData.publicUrl;
}
export async function updateCategory(id: string, updates: Partial<Category>) {
  const { error } = await supabase.from('categories').update(updates as never).eq('id', id);
  if (error) throw error;
}
export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}
export async function createBrand(brand: Partial<Brand>): Promise<Brand> {
  const { data, error } = await supabase.from('brands').insert(brand as never).select('*').single();
  if (error) throw error;
  return data as Brand;
}
export async function updateBrand(id: string, updates: Partial<Brand>) {
  const { error } = await supabase.from('brands').update(updates as never).eq('id', id);
  if (error) throw error;
}
export async function deleteBrand(id: string) {
  const { error } = await supabase.from('brands').delete().eq('id', id);
  if (error) throw error;
}
export async function uploadBrandLogo(file: File, brandId: string): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const fileName = `${brandId}.${ext}`;
  const { data, error } = await supabase.storage.from('brands').upload(fileName, file, { contentType: file.type, upsert: true });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('brands').getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function uploadBrandGalleryImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const safeBase = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  const fileName = `gallery/${Date.now()}-${safeBase || `brand-logo.${ext}`}`;
  const { data, error } = await supabase.storage.from('brands').upload(fileName, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('brands').getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function listBrandGallery(): Promise<string[]> {
  const [rootResult, galleryResult] = await Promise.all([
    supabase.storage.from('brands').list('', { limit: 200, sortBy: { column: 'created_at', order: 'desc' } }),
    supabase.storage.from('brands').list('gallery', { limit: 200, sortBy: { column: 'created_at', order: 'desc' } }),
  ]);
  if (rootResult.error) throw rootResult.error;
  if (galleryResult.error) throw galleryResult.error;
  const rootUrls = (rootResult.data || [])
    .filter(item => !!item.name && !item.name.endsWith('/') && item.name !== 'gallery')
    .map(item => supabase.storage.from('brands').getPublicUrl(item.name).data.publicUrl);
  const galleryUrls = (galleryResult.data || [])
    .filter(item => !!item.name && !item.name.endsWith('/'))
    .map(item => supabase.storage.from('brands').getPublicUrl(`gallery/${item.name}`).data.publicUrl);
  return Array.from(new Set([...rootUrls, ...galleryUrls]));
}
