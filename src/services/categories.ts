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
export async function createCategory(cat: Partial<Category>) {
  const { error } = await supabase.from('categories').insert(cat as never);
  if (error) throw error;
}
export async function updateCategory(id: string, updates: Partial<Category>) {
  const { error } = await supabase.from('categories').update(updates as never).eq('id', id);
  if (error) throw error;
}
export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}
export async function createBrand(brand: Partial<Brand>) {
  const { error } = await supabase.from('brands').insert(brand as never);
  if (error) throw error;
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
  const ext = file.name.split('.').pop();
  const fileName = `${brandId}.${ext}`;
  const { data, error } = await supabase.storage.from('brands').upload(fileName, file, { contentType: file.type, upsert: true });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('brands').getPublicUrl(data.path);
  return urlData.publicUrl;
}
