import { supabase } from '@/db/supabase';
import type { Publication } from '@/types/types';

export async function getPublishedPublications(limit = 12, page = 1): Promise<{ data: Publication[]; count: number }> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const { data, error, count } = await supabase
    .from('publications')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(from, to);
  if (error) throw error;
  return { data: Array.isArray(data) ? (data as Publication[]) : [], count: count ?? 0 };
}

export async function getPublicationById(id: string): Promise<Publication | null> {
  const { data, error } = await supabase
    .from('publications')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle();
  if (error) throw error;
  return data as Publication | null;
}

export async function getAllPublicationsAdmin(): Promise<Publication[]> {
  const { data, error } = await supabase
    .from('publications')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return Array.isArray(data) ? (data as Publication[]) : [];
}

export async function createPublication(pub: Partial<Publication>) {
  const { error } = await supabase.from('publications').insert(pub as never);
  if (error) throw error;
}
export async function updatePublication(id: string, updates: Partial<Publication>) {
  const { error } = await supabase.from('publications').update(updates as never).eq('id', id);
  if (error) throw error;
}
export async function deletePublication(id: string) {
  const { error } = await supabase.from('publications').delete().eq('id', id);
  if (error) throw error;
}
export async function uploadPublicationImage(file: File): Promise<string> {
  const fileName = `pub_${Date.now()}.${file.name.split('.').pop()}`;
  const { data, error } = await supabase.storage.from('publications').upload(fileName, file, { contentType: file.type });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('publications').getPublicUrl(data.path);
  return urlData.publicUrl;
}
