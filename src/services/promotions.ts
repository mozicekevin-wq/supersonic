import { supabase } from '@/db/supabase';
import type { Promotion } from '@/types/types';

export async function getActivePromotions(limit = 20): Promise<Promotion[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('promotions')
    .select(`*, products!product_id(id,name,slug,product_images!product_id(url,is_primary,sort_order))`)
    .eq('is_active', true)
    .lte('start_date', now)
    .gte('end_date', now)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return Array.isArray(data) ? (data as Promotion[]) : [];
}

export async function getAllPromotionsAdmin(): Promise<Promotion[]> {
  const { data, error } = await supabase
    .from('promotions')
    .select(`*, products!product_id(id,name,slug)`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return Array.isArray(data) ? (data as Promotion[]) : [];
}

export async function createPromotion(promo: Partial<Promotion>) {
  const { error } = await supabase.from('promotions').insert(promo as never);
  if (error) throw error;
}
export async function updatePromotion(id: string, updates: Partial<Promotion>) {
  const { error } = await supabase.from('promotions').update(updates as never).eq('id', id);
  if (error) throw error;
}
export async function deletePromotion(id: string) {
  const { error } = await supabase.from('promotions').delete().eq('id', id);
  if (error) throw error;
}
export async function uploadPromotionImage(file: File): Promise<string> {
  const fileName = `promo_${Date.now()}.${file.name.split('.').pop()}`;
  const { data, error } = await supabase.storage.from('publications').upload(fileName, file, { contentType: file.type });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from('publications').getPublicUrl(data.path);
  return urlData.publicUrl;
}
