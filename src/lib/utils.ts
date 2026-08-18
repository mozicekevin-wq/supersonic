import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-CG', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' FCFA';
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
  }).format(new Date(dateStr));
}

export function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date(dateStr));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function buildWhatsAppMessage(
  productName: string,
  customerName: string,
  phone: string,
  city: string,
  address: string,
  quantity: number,
  price: number,
  comment?: string
): string {
  const total = formatPrice(price * quantity);
  let msg = `🛒 *Nouvelle Commande - Société Supersonic*\n\n`;
  msg += `📦 *Produit:* ${productName}\n`;
  msg += `🔢 *Quantité:* ${quantity}\n`;
  msg += `💰 *Prix total:* ${total}\n\n`;
  msg += `👤 *Client:* ${customerName}\n`;
  msg += `📱 *Téléphone:* ${phone}\n`;
  msg += `🏙️ *Ville:* ${city}\n`;
  msg += `📍 *Adresse:* ${address}\n`;
  if (comment) msg += `💬 *Commentaire:* ${comment}\n`;
  msg += `\n_Commande passée sur supersonic-congo.com_`;
  return encodeURIComponent(msg);
}

export function getDiscountPercent(original: number, promo: number): number {
  if (original <= 0) return 0;
  return Math.round(((original - promo) / original) * 100);
}

export function isPromotionActive(startDate: string, endDate: string): boolean {
  const now = new Date();
  return new Date(startDate) <= now && new Date(endDate) >= now;
}

export function getPrimaryImage(images?: { url: string; is_primary: boolean; sort_order: number }[]): string {
  if (!images || images.length === 0) return 'https://via.placeholder.com/400x300?text=No+Image';
  const primary = images.find(i => i.is_primary);
  return primary?.url ?? images.sort((a, b) => a.sort_order - b.sort_order)[0].url;
}
