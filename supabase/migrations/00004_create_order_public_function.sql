-- SECURITY DEFINER function so anon can insert AND get back the order_number
-- without needing SELECT RLS on orders table
CREATE OR REPLACE FUNCTION create_order_public(
  p_product_id      UUID,
  p_product_name    TEXT,
  p_product_price   NUMERIC,
  p_total_amount    NUMERIC,
  p_customer_name   TEXT,
  p_customer_phone  TEXT,
  p_customer_city   TEXT,
  p_delivery_address TEXT,
  p_quantity        INTEGER,
  p_comment         TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order orders%ROWTYPE;
BEGIN
  INSERT INTO orders (
    product_id, product_name, product_price, total_amount,
    customer_name, customer_phone, customer_city, delivery_address,
    quantity, comment
  ) VALUES (
    p_product_id, p_product_name, p_product_price, p_total_amount,
    p_customer_name, p_customer_phone, p_customer_city, p_delivery_address,
    p_quantity, p_comment
  )
  RETURNING * INTO v_order;

  RETURN row_to_json(v_order);
END;
$$;

-- Allow anon and authenticated to call it
GRANT EXECUTE ON FUNCTION create_order_public TO anon, authenticated;