
-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION get_user_role(uid uuid)
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = uid;
$$;

CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = uid AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION is_editor_or_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM profiles WHERE id = uid AND role IN ('admin','editor'));
$$;

-- ============================================
-- PROFILES POLICIES
-- ============================================
CREATE POLICY "Admins full access profiles" ON profiles
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Users view own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE TO authenticated 
  USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM get_user_role(auth.uid()));

-- ============================================
-- CATEGORIES POLICIES
-- ============================================
CREATE POLICY "Anyone reads categories" ON categories
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin/editor manages categories" ON categories
  FOR ALL TO authenticated USING (is_editor_or_admin(auth.uid()));

-- ============================================
-- BRANDS POLICIES
-- ============================================
CREATE POLICY "Anyone reads brands" ON brands
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin/editor manages brands" ON brands
  FOR ALL TO authenticated USING (is_editor_or_admin(auth.uid()));

-- ============================================
-- PRODUCTS POLICIES
-- ============================================
CREATE POLICY "Public reads published products" ON products
  FOR SELECT TO anon, authenticated USING (is_published = true);

CREATE POLICY "Admin/editor reads all products" ON products
  FOR SELECT TO authenticated USING (is_editor_or_admin(auth.uid()));

CREATE POLICY "Admin/editor manages products" ON products
  FOR INSERT TO authenticated WITH CHECK (is_editor_or_admin(auth.uid()));

CREATE POLICY "Admin/editor updates products" ON products
  FOR UPDATE TO authenticated USING (is_editor_or_admin(auth.uid()));

CREATE POLICY "Admin/editor deletes products" ON products
  FOR DELETE TO authenticated USING (is_editor_or_admin(auth.uid()));

-- ============================================
-- PRODUCT IMAGES POLICIES
-- ============================================
CREATE POLICY "Anyone reads product images" ON product_images
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin/editor manages product images" ON product_images
  FOR ALL TO authenticated USING (is_editor_or_admin(auth.uid()));

-- ============================================
-- PROMOTIONS POLICIES
-- ============================================
CREATE POLICY "Public reads active promotions" ON promotions
  FOR SELECT TO anon, authenticated USING (
    is_active = true AND start_date <= now() AND end_date >= now()
  );

CREATE POLICY "Admin/editor reads all promotions" ON promotions
  FOR SELECT TO authenticated USING (is_editor_or_admin(auth.uid()));

CREATE POLICY "Admin/editor manages promotions" ON promotions
  FOR INSERT TO authenticated WITH CHECK (is_editor_or_admin(auth.uid()));

CREATE POLICY "Admin/editor updates promotions" ON promotions
  FOR UPDATE TO authenticated USING (is_editor_or_admin(auth.uid()));

CREATE POLICY "Admin/editor deletes promotions" ON promotions
  FOR DELETE TO authenticated USING (is_editor_or_admin(auth.uid()));

-- ============================================
-- PUBLICATIONS POLICIES
-- ============================================
CREATE POLICY "Public reads published publications" ON publications
  FOR SELECT TO anon, authenticated USING (status = 'published');

CREATE POLICY "Admin/editor reads all publications" ON publications
  FOR SELECT TO authenticated USING (is_editor_or_admin(auth.uid()));

CREATE POLICY "Admin/editor manages publications" ON publications
  FOR INSERT TO authenticated WITH CHECK (is_editor_or_admin(auth.uid()));

CREATE POLICY "Admin/editor updates publications" ON publications
  FOR UPDATE TO authenticated USING (is_editor_or_admin(auth.uid()));

CREATE POLICY "Admin/editor deletes publications" ON publications
  FOR DELETE TO authenticated USING (is_editor_or_admin(auth.uid()));

-- ============================================
-- ORDERS POLICIES
-- ============================================
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins read all orders" ON orders
  FOR SELECT TO authenticated USING (is_editor_or_admin(auth.uid()));

CREATE POLICY "Users read own orders" ON orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Anon reads own orders" ON orders
  FOR SELECT TO anon USING (false);

CREATE POLICY "Admin/editor updates orders" ON orders
  FOR UPDATE TO authenticated USING (is_editor_or_admin(auth.uid()));

CREATE POLICY "Admin deletes orders" ON orders
  FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- ============================================
-- ORDER ITEMS POLICIES
-- ============================================
CREATE POLICY "Anyone can insert order items" ON order_items
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admin/editor reads all order items" ON order_items
  FOR SELECT TO authenticated USING (is_editor_or_admin(auth.uid()));

-- ============================================
-- STORES POLICIES
-- ============================================
CREATE POLICY "Anyone reads stores" ON stores
  FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Admin manages stores" ON stores
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- ============================================
-- CONTACTS POLICIES
-- ============================================
CREATE POLICY "Anyone can submit contact" ON contacts
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admin reads contacts" ON contacts
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Admin updates contacts" ON contacts
  FOR UPDATE TO authenticated USING (is_admin(auth.uid()));

-- ============================================
-- SETTINGS POLICIES
-- ============================================
CREATE POLICY "Anyone reads settings" ON settings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admin manages settings" ON settings
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- ============================================
-- PAGE VIEWS POLICIES
-- ============================================
CREATE POLICY "Anyone inserts page views" ON page_views
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admin reads page views" ON page_views
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

-- ============================================
-- AUTO-SYNC PROFILES
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.phone,
    'user'::public.user_role
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- PUBLIC VIEW
-- ============================================
CREATE VIEW public_profiles AS
  SELECT id, full_name, role, avatar_url FROM profiles;

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_brands_updated BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_promotions_updated BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_publications_updated BEFORE UPDATE ON publications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_stores_updated BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at();
