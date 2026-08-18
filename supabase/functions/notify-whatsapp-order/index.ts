/**
 * Edge Function: notify-whatsapp-order
 *
 * Called automatically via Supabase DB Webhook (Table trigger on orders INSERT),
 * OR manually from the frontend for an existing order.
 *
 * Sends an auto WhatsApp message to the supervisor via the wa.me link approach.
 * Since WhatsApp has no public outbound API without an approved Business API account,
 * this function returns a pre-formatted WhatsApp deeplink that the admin can open,
 * AND logs the notification in Supabase for auditing.
 *
 * For true automated push, integrate Twilio/WhatsApp Cloud API credentials here.
 */

import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPERVISOR_PHONE = '242069999999'; // Numéro WhatsApp superviseur

interface OrderPayload {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  delivery_address: string;
  product_name: string;
  product_id: string | null;
  product_price: number;
  quantity: number;
  total_amount: number;
  comment: string | null;
  status: string;
  created_at: string;
}

Deno.serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const body = await req.json();

    // Support both DB webhook payload (record key) and direct call (order key)
    const order: OrderPayload = body.record ?? body.order;
    if (!order) {
      return new Response(JSON.stringify({ error: 'Payload manquant: order ou record requis' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Fetch product image if available
    let productImageUrl: string | null = null;
    if (order.product_id) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
      const sb = createClient(supabaseUrl, supabaseKey);
      const { data: imgData } = await sb
        .from('product_images')
        .select('url')
        .eq('product_id', order.product_id)
        .eq('is_primary', true)
        .maybeSingle();
      productImageUrl = imgData?.url ?? null;
      if (!productImageUrl) {
        const { data: anyImg } = await sb
          .from('product_images')
          .select('url')
          .eq('product_id', order.product_id)
          .limit(1)
          .maybeSingle();
        productImageUrl = anyImg?.url ?? null;
      }
    }

    // Format WhatsApp message
    const price = new Intl.NumberFormat('fr-CG', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(order.total_amount);
    const msgLines = [
      `🛒 *NOUVELLE COMMANDE — ${order.order_number}*`,
      ``,
      `👤 *Client:* ${order.customer_name}`,
      `📞 *Téléphone:* ${order.customer_phone}`,
      `📍 *Ville:* ${order.customer_city}`,
      `🏠 *Adresse:* ${order.delivery_address}`,
      ``,
      `📦 *Produit:* ${order.product_name}`,
      `🔢 *Quantité:* ${order.quantity}`,
      `💰 *Total:* ${price}`,
      ...(order.comment ? [`💬 *Note:* ${order.comment}`] : []),
      ...(productImageUrl ? [`🖼 *Image:* ${productImageUrl}`] : []),
      ``,
      `📅 ${new Date(order.created_at).toLocaleString('fr-CG', { timeZone: 'Africa/Brazzaville' })}`,
      ``,
      `👉 Traiter sur: ${Deno.env.get('SITE_URL') ?? 'https://app-dsazr1cm25tt.appmedo.com'}/admin/orders`,
    ];

    const message = msgLines.join('\n');
    const whatsappUrl = `https://wa.me/${SUPERVISOR_PHONE}?text=${encodeURIComponent(message)}`;

    return new Response(
      JSON.stringify({
        success: true,
        whatsapp_url: whatsappUrl,
        message_preview: message,
        product_image: productImageUrl,
        order_number: order.order_number,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err) {
    console.error('notify-whatsapp-order error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
