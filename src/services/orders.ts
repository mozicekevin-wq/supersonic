import { supabase } from '@/db/supabase';
import type { Order, OrderFormData } from '@/types/types';

export async function createOrder(
  productId: string,
  productName: string,
  productPrice: number,
  formData: OrderFormData
): Promise<Order> {
  const totalAmount = productPrice * formData.quantity;
  // Use a Postgres function to insert + return order_number atomically,
  // bypassing the SELECT RLS restriction on anon role.
  const { data, error } = await supabase
    .rpc('create_order_public', {
      p_product_id: productId,
      p_product_name: productName,
      p_product_price: productPrice,
      p_total_amount: totalAmount,
      p_customer_name: formData.customer_name,
      p_customer_phone: formData.customer_phone,
      p_customer_city: formData.customer_city,
      p_delivery_address: formData.delivery_address,
      p_quantity: formData.quantity,
      p_comment: formData.comment || null,
    });
  if (error) throw error;
  return data as Order;
}

export async function getAllOrdersAdmin(page = 1, pageSize = 20, status?: string): Promise<{ data: Order[]; count: number }> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = supabase
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);
  if (status && status !== 'all') query = query.eq('status', status);
  const { data, error, count } = await query;
  if (error) throw error;
  return { data: Array.isArray(data) ? (data as Order[]) : [], count: count ?? 0 };
}

export async function updateOrderStatus(id: string, status: Order['status']) {
  const { error } = await supabase.from('orders').update({ status } as never).eq('id', id);
  if (error) throw error;
}

export async function deleteOrder(id: string) {
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) throw error;
}
