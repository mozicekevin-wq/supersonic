import { supabase } from '@/db/supabase';
import type { Store, Setting, DashboardStats } from '@/types/types';

export async function getStores(): Promise<Store[]> {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return Array.isArray(data) ? (data as Store[]) : [];
}

export async function updateStore(id: string, updates: Partial<Store>) {
  const { error } = await supabase.from('stores').update(updates as never).eq('id', id);
  if (error) throw error;
}

export async function getSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from('settings').select('key,value');
  if (error) throw error;
  const result: Record<string, string> = {};
  (data as Setting[]).forEach(s => { result[s.key] = s.value ?? ''; });
  return result;
}

export async function updateSetting(key: string, value: string) {
  const { error } = await supabase
    .from('settings')
    .update({ value, updated_at: new Date().toISOString() } as never)
    .eq('key', key);
  if (error) throw error;
}

export async function upsertSetting(key: string, value: string, description?: string) {
  const { error } = await supabase.from('settings').upsert({ key, value, description } as never, { onConflict: 'key' });
  if (error) throw error;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    { count: total_products },
    { count: available_products },
    { count: out_of_stock },
    { count: total_publications },
    { count: active_promotions },
    { count: total_orders },
    { count: total_customers },
    { data: recent_orders },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).gt('stock', 0).eq('is_published', true),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('stock', 0).eq('is_published', true),
    supabase.from('publications').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('promotions').select('*', { count: 'exact', head: true }).eq('is_active', true).gte('end_date', new Date().toISOString()),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'user'),
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
  ]);

  return {
    total_products: total_products ?? 0,
    available_products: available_products ?? 0,
    out_of_stock: out_of_stock ?? 0,
    total_publications: total_publications ?? 0,
    active_promotions: active_promotions ?? 0,
    total_orders: total_orders ?? 0,
    total_customers: total_customers ?? 0,
    recent_orders: Array.isArray(recent_orders) ? (recent_orders as any[]) : [],
  };
}

export async function getOrdersChartData(): Promise<{ date: string; orders: number; amount: number }[]> {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const { data } = await supabase
    .from('orders')
    .select('created_at,total_amount')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true });
  if (!data) return [];
  const grouped: Record<string, { orders: number; amount: number }> = {};
  (data as any[]).forEach(o => {
    const d = new Date(o.created_at).toISOString().split('T')[0];
    if (!grouped[d]) grouped[d] = { orders: 0, amount: 0 };
    grouped[d].orders += 1;
    grouped[d].amount += Number(o.total_amount);
  });
  return Object.entries(grouped).map(([date, v]) => ({ date, ...v }));
}

export async function getProfiles() {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function updateUserRole(id: string, role: string) {
  const { error } = await supabase.from('profiles').update({ role } as never).eq('id', id);
  if (error) throw error;
}
