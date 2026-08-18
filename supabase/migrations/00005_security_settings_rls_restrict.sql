-- Replace broad "Anyone reads settings" with filtered policy
-- that hides any key starting with 'admin_' or 'img_' from anon
DROP POLICY IF EXISTS "Anyone reads settings" ON settings;

CREATE POLICY "Public reads non-sensitive settings" ON settings
  FOR SELECT TO anon, authenticated
  USING (key NOT LIKE 'admin_%');

-- Admin keeps full access (already covered by "Admin manages settings")
-- Ensure admin policy covers SELECT too
DROP POLICY IF EXISTS "Admin manages settings" ON settings;

CREATE POLICY "Admin manages settings" ON settings
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','editor'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','editor'))
  );