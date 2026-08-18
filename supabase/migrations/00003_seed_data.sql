
-- ============================================
-- STORAGE BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('products', 'products', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('publications', 'publications', true, 5242880, ARRAY['image/jpeg','image/png','image/webp']),
  ('brands', 'brands', true, 2097152, ARRAY['image/jpeg','image/png','image/webp','image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "Public read products bucket" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'products');
CREATE POLICY "Auth upload products bucket" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'products');
CREATE POLICY "Auth update products bucket" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'products');
CREATE POLICY "Auth delete products bucket" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'products');

CREATE POLICY "Public read publications bucket" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'publications');
CREATE POLICY "Auth upload publications bucket" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'publications');
CREATE POLICY "Auth update publications bucket" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'publications');
CREATE POLICY "Auth delete publications bucket" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'publications');

CREATE POLICY "Public read brands bucket" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'brands');
CREATE POLICY "Auth upload brands bucket" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'brands');
CREATE POLICY "Auth update brands bucket" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'brands');
CREATE POLICY "Auth delete brands bucket" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'brands');

-- ============================================
-- SEED: CATEGORIES
-- ============================================
INSERT INTO categories (name, slug, description, icon, sort_order) VALUES
  ('Électronique', 'electronique', 'Smartphones, tablettes, appareils photo et plus', 'Smartphone', 1),
  ('Électroménager', 'electromenager', 'Réfrigérateurs, lave-linge, climatiseurs et plus', 'Refrigerator', 2),
  ('Mobilier', 'mobilier', 'Meubles de maison et décoration intérieure', 'Sofa', 3),
  ('Informatique', 'informatique', 'Ordinateurs, laptops, accessoires informatiques', 'Monitor', 4),
  ('Bureautique', 'bureautique', 'Imprimantes, fournitures de bureau et équipements', 'Printer', 5);

-- ============================================
-- SEED: BRANDS
-- ============================================
INSERT INTO brands (name, slug, sort_order) VALUES
  ('Samsung', 'samsung', 1),
  ('LG', 'lg', 2),
  ('Sony', 'sony', 3),
  ('HP', 'hp', 4),
  ('Dell', 'dell', 5),
  ('Apple', 'apple', 6),
  ('Hisense', 'hisense', 7),
  ('Tefal', 'tefal', 8),
  ('Philips', 'philips', 9),
  ('Huawei', 'huawei', 10);

-- ============================================
-- SEED: PRODUCTS
-- ============================================
WITH cat AS (
  SELECT id, slug FROM categories
), brd AS (
  SELECT id, slug FROM brands
)
INSERT INTO products (name, slug, description, technical_specs, warranty, price, promotional_price, stock, category_id, brand_id, is_published, is_featured, is_new) 
SELECT
  name, slug, description, technical_specs::jsonb, warranty, price, promotional_price, stock,
  (SELECT id FROM cat WHERE slug = cat_slug),
  (SELECT id FROM brd WHERE slug = brd_slug),
  is_published, is_featured, is_new
FROM (VALUES
  (
    'Samsung Galaxy A54 5G', 'samsung-galaxy-a54-5g',
    'Smartphone Samsung Galaxy A54 5G avec écran Super AMOLED 6.4 pouces, processeur Exynos 1380, triple caméra 50MP et batterie 5000mAh.',
    '[{"label":"Écran","value":"Super AMOLED 6.4 pouces"},{"label":"Processeur","value":"Exynos 1380"},{"label":"RAM","value":"8 Go"},{"label":"Stockage","value":"128 Go"},{"label":"Caméra principale","value":"50MP"},{"label":"Batterie","value":"5000mAh"},{"label":"OS","value":"Android 13"},{"label":"5G","value":"Oui"}]',
    '2 ans Samsung', 549000, 499000, 25, 'electronique', 'samsung', true, true, true
  ),
  (
    'Samsung Smart TV 55" 4K UHD', 'samsung-tv-55-4k',
    'Téléviseur Samsung LED 55 pouces 4K UHD avec Smart TV, HDR10+ et système de son Dolby Digital.',
    '[{"label":"Taille écran","value":"55 pouces"},{"label":"Résolution","value":"4K UHD 3840x2160"},{"label":"Smart TV","value":"Tizen OS"},{"label":"Son","value":"Dolby Digital"},{"label":"HDR","value":"HDR10+"},{"label":"Ports HDMI","value":"3"},{"label":"USB","value":"2"}]',
    '2 ans Samsung', 899000, NULL, 15, 'electronique', 'samsung', true, true, false
  ),
  (
    'LG Réfrigérateur Side-by-Side 635L', 'lg-frigo-side-by-side-635l',
    'Réfrigérateur LG Side-by-Side 635L avec distributeur d''eau, technologie InstaView et compresseur Inverter Linéaire.',
    '[{"label":"Capacité","value":"635 litres"},{"label":"Type","value":"Side-by-Side"},{"label":"Compresseur","value":"Inverter Linéaire"},{"label":"InstaView","value":"Oui"},{"label":"Distributeur eau","value":"Oui"},{"label":"Classe énergie","value":"A+"},{"label":"Couleur","value":"Inox"}]',
    '5 ans compresseur, 2 ans pièces', 1250000, 1100000, 8, 'electromenager', 'lg', true, true, false
  ),
  (
    'LG Climatiseur Inverter 18000 BTU', 'lg-clim-inverter-18000',
    'Climatiseur LG Split Inverter 18000 BTU avec Wi-Fi intégré, mode économie d''énergie et filtre PM1.0.',
    '[{"label":"Puissance","value":"18000 BTU"},{"label":"Type","value":"Split Inverter"},{"label":"Wi-Fi","value":"Intégré"},{"label":"Filtre","value":"PM1.0"},{"label":"Mode","value":"Froid/Chaud"},{"label":"Classe énergie","value":"A++"}]',
    '3 ans compresseur, 1 an pièces', 750000, NULL, 12, 'electromenager', 'lg', true, false, true
  ),
  (
    'Dell Laptop Inspiron 15 i5', 'dell-laptop-inspiron-15',
    'Ordinateur portable Dell Inspiron 15 avec processeur Intel Core i5 12ème génération, 8Go RAM, SSD 512Go et écran FHD 15.6 pouces.',
    '[{"label":"Processeur","value":"Intel Core i5-1235U"},{"label":"RAM","value":"8 Go DDR4"},{"label":"Stockage","value":"SSD 512 Go"},{"label":"Écran","value":"15.6\" FHD"},{"label":"Carte graphique","value":"Intel Iris Xe"},{"label":"OS","value":"Windows 11"},{"label":"Batterie","value":"54 Wh"}]',
    '1 an Dell', 695000, 649000, 10, 'informatique', 'dell', true, true, false
  ),
  (
    'HP LaserJet Pro M404n', 'hp-laserjet-pro-m404n',
    'Imprimante laser monochrome HP LaserJet Pro avec impression recto-verso automatique, vitesse 38 ppm et connexion réseau Ethernet.',
    '[{"label":"Type","value":"Laser monochrome"},{"label":"Vitesse","value":"38 ppm"},{"label":"Résolution","value":"1200 dpi"},{"label":"Connexion","value":"Ethernet, USB"},{"label":"Recto-verso","value":"Automatique"},{"label":"Format","value":"A4"}]',
    '1 an HP', 385000, NULL, 20, 'bureautique', 'hp', true, false, false
  ),
  (
    'Sony WH-1000XM5 Casque Bluetooth', 'sony-wh-1000xm5',
    'Casque Bluetooth Sony WH-1000XM5 avec réduction de bruit active leader du marché, autonomie 30h et charge rapide.',
    '[{"label":"Type","value":"Supra-auriculaire"},{"label":"Bluetooth","value":"5.2"},{"label":"ANC","value":"Oui - leader marché"},{"label":"Autonomie","value":"30 heures"},{"label":"Charge rapide","value":"3 min = 3h"},{"label":"Codec","value":"LDAC, AAC, SBC"}]',
    '1 an Sony', 399000, 349000, 18, 'electronique', 'sony', true, false, true
  ),
  (
    'Bureau Direction Cadre Exécutif', 'bureau-direction-executif',
    'Bureau de direction élégant en bois massif avec dessus en verre trempé, tiroirs avec serrure et finitions premium.',
    '[{"label":"Matière","value":"Bois massif + verre trempé"},{"label":"Dimensions","value":"180x90x75 cm"},{"label":"Tiroirs","value":"3 avec serrure"},{"label":"Couleur","value":"Wengé/Noir"},{"label":"Poids max","value":"150 kg"}]',
    '1 an fabricant', 485000, NULL, 5, 'mobilier', 'philips', true, false, false
  )
) AS p(name, slug, description, technical_specs, warranty, price, promotional_price, stock, cat_slug, brd_slug, is_published, is_featured, is_new);

-- ============================================
-- SEED: PRODUCT IMAGES
-- ============================================
WITH prod AS (SELECT id, slug FROM products)
INSERT INTO product_images (product_id, url, alt_text, sort_order, is_primary)
SELECT
  (SELECT id FROM prod WHERE slug = product_slug),
  image_url, alt_text, sort_order, is_primary
FROM (VALUES
  ('samsung-galaxy-a54-5g', 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_7d67ff48-bae1-4824-81ef-67cb0ec0b363.jpg', 'Samsung Galaxy A54 5G', 0, true),
  ('samsung-tv-55-4k', 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_d6c7f5ab-f4ab-4042-865e-35331e53c7fd.jpg', 'Samsung TV 55" 4K', 0, true),
  ('lg-frigo-side-by-side-635l', 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_0dac19cc-7b06-46ed-bac9-579962018acb.jpg', 'LG Réfrigérateur Side-by-Side', 0, true),
  ('lg-clim-inverter-18000', 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_6e3e2b62-c878-464c-9b41-b575310a0866.jpg', 'LG Climatiseur Inverter', 0, true),
  ('dell-laptop-inspiron-15', 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_f5bfd6f1-9d61-44de-986d-41237f4f9120.jpg', 'Dell Laptop Inspiron 15', 0, true),
  ('hp-laserjet-pro-m404n', 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_7db5936b-456c-42ab-88ef-3d1eecdb9113.jpg', 'HP LaserJet Pro M404n', 0, true),
  ('sony-wh-1000xm5', 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_92bc0173-0645-49db-b08c-6e800026c90e.jpg', 'Sony WH-1000XM5', 0, true),
  ('bureau-direction-executif', 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_bcc3951f-0a06-4aea-84e9-42b9b65a6143.jpg', 'Bureau Direction Exécutif', 0, true)
) AS pi(product_slug, image_url, alt_text, sort_order, is_primary);

-- ============================================
-- SEED: PROMOTIONS
-- ============================================
INSERT INTO promotions (title, description, image_url, product_id, original_price, promotional_price, start_date, end_date, is_active)
SELECT
  'Promo Samsung Galaxy A54 5G',
  'Profitez de notre offre spéciale sur le Samsung Galaxy A54 5G, le smartphone 5G le plus vendu au Congo!',
  'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_7d67ff48-bae1-4824-81ef-67cb0ec0b363.jpg',
  (SELECT id FROM products WHERE slug = 'samsung-galaxy-a54-5g'),
  549000, 499000, now(), now() + interval '30 days', true;

INSERT INTO promotions (title, description, image_url, product_id, original_price, promotional_price, start_date, end_date, is_active)
SELECT
  'Offre Spéciale LG Réfrigérateur',
  'Grand frigo LG Side-by-Side en promotion limitée. Idéal pour les familles congolaises exigeantes.',
  'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_0dac19cc-7b06-46ed-bac9-579962018acb.jpg',
  (SELECT id FROM products WHERE slug = 'lg-frigo-side-by-side-635l'),
  1250000, 1100000, now(), now() + interval '14 days', true;

INSERT INTO promotions (title, description, image_url, product_id, original_price, promotional_price, start_date, end_date, is_active)
SELECT
  'Dell Laptop i5 à Prix Réduit',
  'Équipez votre bureau avec le Dell Inspiron 15 i5, performance et fiabilité au meilleur prix.',
  'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_f5bfd6f1-9d61-44de-986d-41237f4f9120.jpg',
  (SELECT id FROM products WHERE slug = 'dell-laptop-inspiron-15'),
  695000, 649000, now(), now() + interval '21 days', true;

-- ============================================
-- SEED: PUBLICATIONS
-- ============================================
INSERT INTO publications (title, content, excerpt, image_url, status, type, published_at) VALUES
(
  'Nouveau arrivage Samsung Galaxy A54 5G en stock!',
  '<p>Nous sommes ravis d''annoncer l''arrivée du <strong>Samsung Galaxy A54 5G</strong> dans nos magasins de Pointe-Noire et Brazzaville.</p><p>Ce smartphone de dernière génération offre une expérience utilisateur exceptionnelle avec son écran Super AMOLED 6.4 pouces et son processeur Exynos 1380 ultra-puissant.</p><p>Rendez-vous dans nos magasins pour le découvrir!</p>',
  'Le Samsung Galaxy A54 5G est désormais disponible dans nos deux magasins.',
  'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_7d67ff48-bae1-4824-81ef-67cb0ec0b363.jpg',
  'published', 'news', now() - interval '2 days'
),
(
  'Promotions de fin de mois - Économisez jusqu''à 20%',
  '<p>Société Supersonic vous propose des <strong>promotions exceptionnelles</strong> de fin de mois sur une sélection de produits!</p><p>Profitez de réductions allant jusqu''à 20% sur les smartphones, réfrigérateurs et ordinateurs portables.</p><p>Offre valable jusqu''à épuisement des stocks.</p>',
  'Promotions exceptionnelles sur une sélection de produits électroniques et électroménagers.',
  'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_cdfba6e0-af7c-484b-9eb1-950af6e73d61.jpg',
  'published', 'promotion', now() - interval '5 days'
),
(
  'Ouverture du nouveau showroom à Brazzaville',
  '<p>Société Supersonic est fière d''annoncer l''ouverture de son <strong>nouveau showroom</strong> à Brazzaville, encore plus grand et plus moderne.</p><p>Vous pourrez désormais découvrir l''ensemble de notre catalogue dans un espace d''exposition de 500m² climatisé.</p><p>Venez nous rendre visite!</p>',
  'Supersonic ouvre un nouveau showroom à Brazzaville avec 500m² d''exposition.',
  'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_b51f9e08-8c1a-49da-81e6-ba034eb634b0.jpg',
  'published', 'announcement', now() - interval '10 days'
);

-- ============================================
-- SEED: STORES
-- ============================================
INSERT INTO stores (name, city, address, phone, phone2, email, opening_hours, latitude, longitude, sort_order) VALUES
(
  'Supersonic Pointe-Noire',
  'Pointe-Noire',
  'Avenue Charles de Gaulle, Centre Commercial, Pointe-Noire, Congo',
  '+242 06 xxx xx xx',
  '+242 05 xxx xx xx',
  'pointe-noire@supersonic-congo.com',
  'Lun-Sam: 8h00 - 19h00 | Dim: 9h00 - 14h00',
  -4.7890, 11.8647, 1
),
(
  'Supersonic Brazzaville',
  'Brazzaville',
  'Avenue de l''Indépendance, Centre-ville, Brazzaville, Congo',
  '+242 06 xxx xx xx',
  '+242 05 xxx xx xx',
  'brazzaville@supersonic-congo.com',
  'Lun-Sam: 8h00 - 19h00 | Dim: 9h00 - 14h00',
  -4.2634, 15.2429, 2
);

-- ============================================
-- SEED: SETTINGS
-- ============================================
INSERT INTO settings (key, value, description) VALUES
  ('site_name', 'Société Supersonic', 'Nom du site'),
  ('site_tagline', 'Votre spécialiste en électronique, électroménager et informatique au Congo', 'Tagline du site'),
  ('contact_phone_1', '+242 06 xxx xx xx', 'Téléphone principal'),
  ('contact_phone_2', '+242 05 xxx xx xx', 'Téléphone secondaire'),
  ('contact_email', 'contact@supersonic-congo.com', 'Email de contact'),
  ('contact_whatsapp', '+242069999999', 'WhatsApp principal'),
  ('facebook_url', 'https://facebook.com/supersonic.congo', 'Page Facebook'),
  ('instagram_url', 'https://instagram.com/supersonic.congo', 'Compte Instagram'),
  ('twitter_url', '', 'Compte Twitter'),
  ('youtube_url', '', 'Chaîne YouTube'),
  ('about_text', 'Société Supersonic est votre partenaire de confiance pour l''électronique, l''électroménager, le mobilier, l''informatique et la bureautique au Congo depuis plus de 10 ans. Nous proposons les meilleures marques mondiales avec un service client exceptionnel.', 'Présentation de l''entreprise'),
  ('meta_description', 'Société Supersonic - Vente d''électronique, électroménager, mobilier, informatique et bureautique à Brazzaville et Pointe-Noire, Congo. Commandez en ligne ou visitez nos magasins.', 'Meta description SEO');
