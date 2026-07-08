-- Seed script for moms_db

USE moms_db;

-- 1. Insert Master Roles
INSERT INTO MM_MAS_ROLE (ROLE_ID, ROLE_NAME, ROLE_DESCRIPTION, ROLE_STATUS) VALUES
('ADMIN', 'Administrator', 'Full site access and management controls', 'ACTIVE'),
('CUSTOMER', 'Customer', 'Browse products, place orders, and manage cart', 'ACTIVE')
ON DUPLICATE KEY UPDATE ROLE_NAME=ROLE_NAME;

-- 2. Insert Category Master
INSERT INTO MM_MAS_CATEGORY (CATEGORY_ID, CATEGORY_NAME, CATEGORY_DESCRIPTION, CATEGORY_STATUS) VALUES
('SNACKS', 'Snacks', 'Delicious homemade snacks and savories', 'ACTIVE'),
('DRY_FOODS', 'Dry Foods', 'Pure and high quality dry fruits and seeds', 'ACTIVE')
ON DUPLICATE KEY UPDATE CATEGORY_NAME=CATEGORY_NAME;

-- 3. Insert Brand Master
INSERT INTO MM_MAS_BRAND (BRAND_ID, BRAND_NAME, BRAND_STATUS) VALUES
('MOMSAFFECTION', 'MomsAffection', 'ACTIVE')
ON DUPLICATE KEY UPDATE BRAND_NAME=BRAND_NAME;

-- 4. Create default admin user (Password: adminpassword)
INSERT INTO MM_USER_LOGIN (USER_ID, USER_ROLE_ID, USER_EMAIL, USER_MOBILE, USER_PASSWORD, USER_STATUS) VALUES
('admin_user_01', 'ADMIN', 'admin@momsaffection.com', '1234567890', '$2y$12$gZpj6bNLIL7cMFl8nWp3GOh/10I9ATanivj5fWMp7yBmUmoy8HdLG', 'ACTIVE')
ON DUPLICATE KEY UPDATE USER_EMAIL=USER_EMAIL;

INSERT INTO MM_ADMIN (ADMIN_ID, USER_ID, ADMIN_NAME, ADMIN_IMAGE, ADMIN_ADDRESS) VALUES
('admin_01', 'admin_user_01', 'MomsAffection Admin', NULL, 'Head Office, MomsAffection')
ON DUPLICATE KEY UPDATE ADMIN_NAME=ADMIN_NAME;

-- 5. Seed Products
INSERT INTO MM_PRODUCT (PRODUCT_ID, CATEGORY_ID, BRAND_ID, PRODUCT_NAME, PRODUCT_DESCRIPTION, PRODUCT_PRICE, PRODUCT_STOCK, PRODUCT_IMAGE, PRODUCT_STATUS) VALUES
-- Snacks Category
('prod_tok_jhal_misti', 'SNACKS', 'MOMSAFFECTION', 'Tok Jhal Misti 250g', 'Classic Bengali sweet, sour and spicy snack mix made with premium quality ingredients.', 80.00, 100, NULL, 'ACTIVE'),
('prod_mayuri_chanachur', 'SNACKS', 'MOMSAFFECTION', 'Mayuri Chanachur 250g', 'Our bestseller crispy hot spicy mix, handcrafted from grandmother\'s recipe.', 75.00, 120, NULL, 'ACTIVE'),
('prod_maglai_chanachur', 'SNACKS', 'MOMSAFFECTION', 'Maglai Chanachur 250g', 'Rich Mughal styled flavorful crunch with raisins, cashew nuts, and spices.', 85.00, 80, NULL, 'ACTIVE'),
('prod_crispy_shreds', 'SNACKS', 'MOMSAFFECTION', 'Crispy Fried Shreds 250g', 'Thin and crunchy potato shreds fried to golden excellence.', 90.00, 60, NULL, 'ACTIVE'),
('prod_big_bhujiya', 'SNACKS', 'MOMSAFFECTION', 'big bhujiya sev 400g', 'Thick gram flour noodles spiced with moth beans and traditional condiments.', 140.00, 50, NULL, 'ACTIVE'),
('prod_masala_matar', 'SNACKS', 'MOMSAFFECTION', 'Masala Matar 400g', 'Spicy fried green peas spiced with chat masala and black salt.', 120.00, 90, NULL, 'ACTIVE'),
('prod_natural_mix_chira', 'SNACKS', 'MOMSAFFECTION', 'natural mix chira 400g', 'Crispy roasted flattened rice mixed with roasted nuts, green chillies and curry leaves.', 110.00, 70, NULL, 'ACTIVE'),
('prod_small_bhujiya', 'SNACKS', 'MOMSAFFECTION', 'small bhujiya sev 400g', 'Crispy fine sev cooked in double refined oil. Melts in mouth.', 130.00, 110, NULL, 'ACTIVE'),

-- Dry Foods Category
('prod_almonds_500g', 'DRY_FOODS', 'MOMSAFFECTION', 'Almonds 500g', 'Raw premium California almonds, rich in protein and fiber.', 450.00, 45, NULL, 'ACTIVE'),
('prod_cashew_500g', 'DRY_FOODS', 'MOMSAFFECTION', 'Cashew 500g', 'Crispy whole cashew nuts, carefully graded and processed.', 500.00, 35, NULL, 'ACTIVE'),
('prod_makhana_500g', 'DRY_FOODS', 'MOMSAFFECTION', 'Makhana 500g', 'Puffed lotus seeds roasted and packed carefully to keep fresh.', 350.00, 60, NULL, 'ACTIVE'),
('prod_peanuts_500g', 'DRY_FOODS', 'MOMSAFFECTION', 'Peanuts 500g', 'Premium roasted peanuts with light salted finish.', 150.00, 80, NULL, 'ACTIVE'),
('prod_pista_500g', 'DRY_FOODS', 'MOMSAFFECTION', 'pista-500g', 'Roasted and salted pistachios with outer shell.', 550.00, 25, NULL, 'ACTIVE'),
('prod_raisins_500g', 'DRY_FOODS', 'MOMSAFFECTION', 'Raisins 500g', 'Sweet and juicy green raisins dried under natural hygienic conditions.', 250.00, 50, NULL, 'ACTIVE')
ON DUPLICATE KEY UPDATE PRODUCT_PRICE=VALUES(PRODUCT_PRICE), PRODUCT_STOCK=VALUES(PRODUCT_STOCK);
