export type UserRole = 'user' | 'admin' | 'editor';
export type OrderStatus = 'new' | 'in_progress' | 'confirmed' | 'prepared' | 'delivered' | 'cancelled';
export type PublicationStatus = 'draft' | 'published' | 'scheduled';
export type PublicationType = 'news' | 'promotion' | 'announcement' | 'event' | 'special_offer' | 'commercial';

export interface Profile {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface TechSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  technical_specs: TechSpec[];
  warranty: string | null;
  price: number;
  promotional_price: number | null;
  stock: number;
  category_id: string | null;
  brand_id: string | null;
  is_published: boolean;
  is_featured: boolean;
  is_new: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  // Joined
  categories?: Category | null;
  brands?: Brand | null;
  product_images?: ProductImage[];
}

export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  product_id: string | null;
  original_price: number;
  promotional_price: number;
  discount_percentage: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  products?: Product | null;
}

export interface Publication {
  id: string;
  title: string;
  content: string | null;
  excerpt: string | null;
  image_url: string | null;
  status: PublicationStatus;
  type: PublicationType;
  published_at: string | null;
  scheduled_at: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Pick<Profile, 'full_name' | 'email'> | null;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  delivery_address: string;
  comment: string | null;
  status: OrderStatus;
  total_amount: number;
  product_id: string | null;
  product_name: string;
  product_price: number;
  quantity: number;
  user_id: string | null;
  created_at: string;
  updated_at: string;
  products?: Pick<Product, 'name' | 'slug'> | null;
}

export interface Store {
  id: string;
  name: string;
  city: string;
  address: string | null;
  phone: string | null;
  phone2: string | null;
  email: string | null;
  opening_hours: string | null;
  latitude: number | null;
  longitude: number | null;
  google_maps_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
  updated_at: string;
}

export interface PageView {
  id: string;
  page: string;
  product_id: string | null;
  user_id: string | null;
  ip_hash: string | null;
  created_at: string;
}

export interface OrderFormData {
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  delivery_address: string;
  quantity: number;
  comment: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface ProductFilters {
  search?: string;
  category_id?: string;
  brand_id?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  is_promotion?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
}

export interface DashboardStats {
  total_products: number;
  available_products: number;
  out_of_stock: number;
  total_publications: number;
  active_promotions: number;
  total_orders: number;
  total_customers: number;
  recent_orders: Order[];
}
