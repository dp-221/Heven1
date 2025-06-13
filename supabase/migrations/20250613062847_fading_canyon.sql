/*
  # Seed Initial Data

  1. Categories
  2. Products with variants and images
  3. Admin user
  4. Sample coupons
*/

-- Insert categories
INSERT INTO categories (name, description, is_active) VALUES
('Clothing', 'Fashion clothing for all occasions', true),
('Footwear', 'Shoes and sandals for every style', true),
('Accessories', 'Complete your look with our accessories', true);

-- Insert products
INSERT INTO products (name, description, category_id, price, original_price, sku, stock_quantity, is_featured, is_trending, rating, review_count) VALUES
(
  'Premium Cotton T-Shirt',
  'Premium quality cotton t-shirt with modern fit. Perfect for casual wear and everyday comfort. Made from 100% organic cotton with superior breathability.',
  (SELECT id FROM categories WHERE name = 'Clothing'),
  299.00,
  399.00,
  'HEVEN-TSH-001',
  100,
  true,
  true,
  4.5,
  128
),
(
  'Classic Leather Jacket',
  'Timeless leather jacket crafted from genuine leather. Features classic design with modern touches. Perfect for any season.',
  (SELECT id FROM categories WHERE name = 'Clothing'),
  1299.00,
  1599.00,
  'HEVEN-JKT-001',
  50,
  true,
  false,
  4.8,
  89
),
(
  'Designer Sneakers',
  'Contemporary designer sneakers with premium materials and exceptional comfort. Perfect blend of style and functionality.',
  (SELECT id FROM categories WHERE name = 'Footwear'),
  899.00,
  NULL,
  'HEVEN-SNK-001',
  75,
  false,
  true,
  4.6,
  156
),
(
  'Minimalist Watch',
  'Elegant minimalist watch with clean design and premium materials. Features precise movement and water resistance.',
  (SELECT id FROM categories WHERE name = 'Accessories'),
  599.00,
  799.00,
  'HEVEN-WTC-001',
  30,
  true,
  false,
  4.7,
  203
),
(
  'Premium Backpack',
  'High-quality backpack with multiple compartments and ergonomic design. Perfect for work, travel, or everyday use.',
  (SELECT id FROM categories WHERE name = 'Accessories'),
  449.00,
  NULL,
  'HEVEN-BAG-001',
  60,
  false,
  true,
  4.4,
  92
),
(
  'Slim Fit Jeans',
  'Modern slim fit jeans with premium denim fabric. Comfortable stretch material with contemporary styling.',
  (SELECT id FROM categories WHERE name = 'Clothing'),
  799.00,
  999.00,
  'HEVEN-JNS-001',
  80,
  false,
  true,
  4.3,
  167
);

-- Insert product images
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
-- T-Shirt images
((SELECT id FROM products WHERE sku = 'HEVEN-TSH-001'), 'https://images.pexels.com/photos/769732/pexels-photo-769732.jpeg?auto=compress&cs=tinysrgb&w=800', 'Premium Cotton T-Shirt', true, 1),
((SELECT id FROM products WHERE sku = 'HEVEN-TSH-001'), 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=800', 'Premium Cotton T-Shirt Back View', false, 2),

-- Leather Jacket images
((SELECT id FROM products WHERE sku = 'HEVEN-JKT-001'), 'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=800', 'Classic Leather Jacket', true, 1),
((SELECT id FROM products WHERE sku = 'HEVEN-JKT-001'), 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800', 'Classic Leather Jacket Detail', false, 2),

-- Sneakers images
((SELECT id FROM products WHERE sku = 'HEVEN-SNK-001'), 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800', 'Designer Sneakers', true, 1),
((SELECT id FROM products WHERE sku = 'HEVEN-SNK-001'), 'https://images.pexels.com/photos/1478442/pexels-photo-1478442.jpeg?auto=compress&cs=tinysrgb&w=800', 'Designer Sneakers Side View', false, 2),

-- Watch images
((SELECT id FROM products WHERE sku = 'HEVEN-WTC-001'), 'https://images.pexels.com/photos/190819/pexels-photo-190819.jpeg?auto=compress&cs=tinysrgb&w=800', 'Minimalist Watch', true, 1),
((SELECT id FROM products WHERE sku = 'HEVEN-WTC-001'), 'https://images.pexels.com/photos/277319/pexels-photo-277319.jpeg?auto=compress&cs=tinysrgb&w=800', 'Minimalist Watch Detail', false, 2),

-- Backpack images
((SELECT id FROM products WHERE sku = 'HEVEN-BAG-001'), 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=800', 'Premium Backpack', true, 1),
((SELECT id FROM products WHERE sku = 'HEVEN-BAG-001'), 'https://images.pexels.com/photos/2422278/pexels-photo-2422278.jpeg?auto=compress&cs=tinysrgb&w=800', 'Premium Backpack Interior', false, 2),

-- Jeans images
((SELECT id FROM products WHERE sku = 'HEVEN-JNS-001'), 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg?auto=compress&cs=tinysrgb&w=800', 'Slim Fit Jeans', true, 1),
((SELECT id FROM products WHERE sku = 'HEVEN-JNS-001'), 'https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg?auto=compress&cs=tinysrgb&w=800', 'Slim Fit Jeans Detail', false, 2);

-- Insert product variants
INSERT INTO product_variants (product_id, size, color, stock_quantity) VALUES
-- T-Shirt variants
((SELECT id FROM products WHERE sku = 'HEVEN-TSH-001'), 'S', 'Black', 20),
((SELECT id FROM products WHERE sku = 'HEVEN-TSH-001'), 'M', 'Black', 25),
((SELECT id FROM products WHERE sku = 'HEVEN-TSH-001'), 'L', 'Black', 20),
((SELECT id FROM products WHERE sku = 'HEVEN-TSH-001'), 'XL', 'Black', 15),
((SELECT id FROM products WHERE sku = 'HEVEN-TSH-001'), 'S', 'White', 20),
((SELECT id FROM products WHERE sku = 'HEVEN-TSH-001'), 'M', 'White', 25),
((SELECT id FROM products WHERE sku = 'HEVEN-TSH-001'), 'L', 'White', 20),
((SELECT id FROM products WHERE sku = 'HEVEN-TSH-001'), 'XL', 'White', 15),

-- Leather Jacket variants
((SELECT id FROM products WHERE sku = 'HEVEN-JKT-001'), 'S', 'Black', 10),
((SELECT id FROM products WHERE sku = 'HEVEN-JKT-001'), 'M', 'Black', 15),
((SELECT id FROM products WHERE sku = 'HEVEN-JKT-001'), 'L', 'Black', 15),
((SELECT id FROM products WHERE sku = 'HEVEN-JKT-001'), 'XL', 'Black', 10),
((SELECT id FROM products WHERE sku = 'HEVEN-JKT-001'), 'S', 'Brown', 8),
((SELECT id FROM products WHERE sku = 'HEVEN-JKT-001'), 'M', 'Brown', 12),
((SELECT id FROM products WHERE sku = 'HEVEN-JKT-001'), 'L', 'Brown', 12),
((SELECT id FROM products WHERE sku = 'HEVEN-JKT-001'), 'XL', 'Brown', 8),

-- Sneakers variants
((SELECT id FROM products WHERE sku = 'HEVEN-SNK-001'), '7', 'White', 12),
((SELECT id FROM products WHERE sku = 'HEVEN-SNK-001'), '8', 'White', 15),
((SELECT id FROM products WHERE sku = 'HEVEN-SNK-001'), '9', 'White', 15),
((SELECT id FROM products WHERE sku = 'HEVEN-SNK-001'), '10', 'White', 12),
((SELECT id FROM products WHERE sku = 'HEVEN-SNK-001'), '11', 'White', 10),
((SELECT id FROM products WHERE sku = 'HEVEN-SNK-001'), '7', 'Black', 10),
((SELECT id FROM products WHERE sku = 'HEVEN-SNK-001'), '8', 'Black', 12),
((SELECT id FROM products WHERE sku = 'HEVEN-SNK-001'), '9', 'Black', 12),
((SELECT id FROM products WHERE sku = 'HEVEN-SNK-001'), '10', 'Black', 10),
((SELECT id FROM products WHERE sku = 'HEVEN-SNK-001'), '11', 'Black', 8),

-- Watch variants
((SELECT id FROM products WHERE sku = 'HEVEN-WTC-001'), 'One Size', 'Silver', 10),
((SELECT id FROM products WHERE sku = 'HEVEN-WTC-001'), 'One Size', 'Gold', 10),
((SELECT id FROM products WHERE sku = 'HEVEN-WTC-001'), 'One Size', 'Black', 10),

-- Backpack variants
((SELECT id FROM products WHERE sku = 'HEVEN-BAG-001'), 'One Size', 'Black', 20),
((SELECT id FROM products WHERE sku = 'HEVEN-BAG-001'), 'One Size', 'Navy', 20),
((SELECT id FROM products WHERE sku = 'HEVEN-BAG-001'), 'One Size', 'Gray', 20),

-- Jeans variants
((SELECT id FROM products WHERE sku = 'HEVEN-JNS-001'), '28', 'Dark Blue', 15),
((SELECT id FROM products WHERE sku = 'HEVEN-JNS-001'), '30', 'Dark Blue', 20),
((SELECT id FROM products WHERE sku = 'HEVEN-JNS-001'), '32', 'Dark Blue', 20),
((SELECT id FROM products WHERE sku = 'HEVEN-JNS-001'), '34', 'Dark Blue', 15),
((SELECT id FROM products WHERE sku = 'HEVEN-JNS-001'), '36', 'Dark Blue', 10),
((SELECT id FROM products WHERE sku = 'HEVEN-JNS-001'), '28', 'Black', 12),
((SELECT id FROM products WHERE sku = 'HEVEN-JNS-001'), '30', 'Black', 15),
((SELECT id FROM products WHERE sku = 'HEVEN-JNS-001'), '32', 'Black', 15),
((SELECT id FROM products WHERE sku = 'HEVEN-JNS-001'), '34', 'Black', 12),
((SELECT id FROM products WHERE sku = 'HEVEN-JNS-001'), '36', 'Black', 8);

-- Insert sample coupons
INSERT INTO coupons (code, type, value, min_order_value, max_discount, usage_limit, description, expires_at) VALUES
('WELCOME10', 'percentage', 10.00, 500.00, 200.00, 100, 'Welcome discount for new users', '2025-01-31 23:59:59'),
('FLAT50', 'fixed', 50.00, 300.00, NULL, 200, 'Flat ₹50 off on orders above ₹300', '2024-12-31 23:59:59'),
('SAVE20', 'percentage', 20.00, 1000.00, 500.00, 50, '20% off on orders above ₹1000', '2025-02-28 23:59:59');