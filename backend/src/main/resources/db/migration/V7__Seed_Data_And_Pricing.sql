-- V7__Seed_Data_And_Pricing.sql
-- Seed initial data for development and testing

-- Seed Tables for Venue ID 1 (Midnight Lounge)
INSERT INTO guest.tables (venue_id, table_number, capacity, is_active) VALUES
(1, 'T1', 2, TRUE),
(1, 'T2', 2, TRUE),
(1, 'T3', 4, TRUE),
(1, 'T4', 4, TRUE),
(1, 'T5', 6, TRUE),
(1, 'T6', 6, TRUE),
(1, 'T7', 8, FALSE), -- Maintenance
(1, 'BAR-1', 1, TRUE),
(1, 'BAR-2', 1, TRUE),
(1, 'BAR-3', 1, TRUE),
(1, 'BAR-4', 1, TRUE),
(1, 'VIP-1', 10, TRUE),
(1, 'VIP-2', 12, TRUE);

-- Seed menu items for Venue 1 (Midnight Lounge)
INSERT INTO menu_items (name, description, category, price, cost, venue_id, available, is_active, image_url) VALUES
-- Cocktails
('Smoked Old Fashioned', 'Bourbon, maple syrup, angostura bitters, hickory smoke.', 'COCKTAIL', 14.00, 4.50, 1, TRUE, TRUE, 'https://images.unsplash.com/photo-1536935338788-843bb528a346?q=80&w=1000&auto=format&fit=crop'),
('Midnight Spritz', 'Violet liqueur, prosecco, soda water, fresh blackberries.', 'COCKTAIL', 12.00, 3.80, 1, TRUE, TRUE, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=1000&auto=format&fit=crop'),
('Espresso Martini', 'Vodka, Kahlúa, freshly brewed espresso, coffee beans.', 'COCKTAIL', 13.00, 4.00, 1, TRUE, TRUE, 'https://images.unsplash.com/photo-1572554254457-a0e37e1c95a9?q=80&w=1000&auto=format&fit=crop'),
('Negroni Sbagliato', 'Campari, sweet vermouth, prosecco, orange peel.', 'COCKTAIL', 11.00, 3.50, 1, TRUE, TRUE, 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?q=80&w=1000&auto=format&fit=crop'),
('Tokyo Highball', 'Japanese whisky, sparkling water, yuzu, shiso leaf.', 'COCKTAIL', 15.00, 5.00, 1, TRUE, TRUE, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1000&auto=format&fit=crop'),

-- Food
('Truffle Ribeye', '300g Argentinian ribeye, truffle butter, grilled asparagus.', 'FOOD', 32.00, 14.00, 1, TRUE, TRUE, 'https://images.unsplash.com/photo-1544025162-d76690b60943?q=80&w=1000&auto=format&fit=crop'),
('Wagyu Sliders', 'Three brioche buns, caramelized onion, gruyère, special sauce.', 'FOOD', 18.00, 7.50, 1, TRUE, TRUE, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop'),
('Lobster Risotto', 'Arborio rice, lobster tail, saffron, parmesan, chive oil.', 'FOOD', 28.00, 12.00, 1, TRUE, TRUE, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=1000&auto=format&fit=crop'),
('Tuna Tartare', 'Yellowfin tuna, avocado mousse, sesame, wonton crisps.', 'FOOD', 16.00, 6.50, 1, TRUE, TRUE, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000&auto=format&fit=crop'),

-- Snacks
('Truffle Fries', 'Hand-cut fries, truffle oil, parmesan, rosemary salt.', 'SNACK', 9.00, 2.50, 1, TRUE, TRUE, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=1000&auto=format&fit=crop'),
('Burrata Board', 'Fresh burrata, prosciutto, sun-dried tomatoes, sourdough.', 'SNACK', 14.00, 5.00, 1, TRUE, TRUE, 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?q=80&w=1000&auto=format&fit=crop'),
('Edamame', 'Steamed soybeans, Maldon sea salt, chili flakes.', 'SNACK', 6.00, 1.50, 1, TRUE, TRUE, 'https://images.unsplash.com/photo-1564834744159-ff0ea41ba4b9?q=80&w=1000&auto=format&fit=crop'),

-- Beer
('Stuttgart Pilsner', 'Craft pilsner from local Stuttgart brewery, 500ml draft.', 'BEER', 6.50, 2.00, 1, TRUE, TRUE, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=1000&auto=format&fit=crop'),
('Belgian Tripel', 'Abbey-style tripel, 330ml bottle, golden and complex.', 'BEER', 8.00, 3.00, 1, TRUE, TRUE, 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?q=80&w=1000&auto=format&fit=crop'),

-- Wine
('Châteauneuf-du-Pape', 'Full-bodied Rhône Valley red, cherry, pepper, leather. Glass.', 'WINE', 14.00, 5.50, 1, TRUE, TRUE, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1000&auto=format&fit=crop'),
('Chablis Premier Cru', 'Crisp Burgundy white, citrus, mineral, elegant. Glass.', 'WINE', 12.00, 4.80, 1, TRUE, TRUE, 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?q=80&w=1000&auto=format&fit=crop'),

-- Dessert
('Dark Chocolate Fondant', 'Warm molten center, vanilla ice cream, salted caramel.', 'DESSERT', 11.00, 3.50, 1, TRUE, TRUE, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=1000&auto=format&fit=crop'),
('Tiramisu', 'Classic Italian, mascarpone, espresso-soaked ladyfingers.', 'DESSERT', 10.00, 3.00, 1, TRUE, TRUE, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?q=80&w=1000&auto=format&fit=crop'),

-- Soft Drink
('Sparkling Water', 'San Pellegrino 750ml, served chilled with lemon.', 'SOFT_DRINK', 4.50, 1.00, 1, TRUE, TRUE, 'https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=1000&auto=format&fit=crop'),
('Fresh Lemonade', 'House-made with mint, ginger, and raw honey.', 'SOFT_DRINK', 5.50, 1.20, 1, TRUE, TRUE, 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?q=80&w=1000&auto=format&fit=crop');
