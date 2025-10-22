-- Drop existing policies to recreate with exact specifications
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Suppliers can view their own data" ON public.suppliers;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "Suppliers can manage their products" ON public.products;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Order items are viewable with order access" ON public.order_items;
DROP POLICY IF EXISTS "Featured slots are viewable by everyone" ON public.featured_slots;
DROP POLICY IF EXISTS "Suppliers can manage their featured slots" ON public.featured_slots;
DROP POLICY IF EXISTS "Suppliers can view their subscriptions" ON public.subscriptions;

-- USERS TABLE POLICIES
-- Users can view only their own profile
CREATE POLICY "users_view_own_profile" ON public.users
    FOR SELECT 
    USING (auth.uid() = id);

-- Users can update only their own profile
CREATE POLICY "users_update_own_profile" ON public.users
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can insert their own profile during registration
CREATE POLICY "users_insert_own_profile" ON public.users
    FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- SUPPLIERS TABLE POLICIES
-- Suppliers can view only their own business data
CREATE POLICY "suppliers_view_own_data" ON public.suppliers
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Suppliers can update only their own business data
CREATE POLICY "suppliers_update_own_data" ON public.suppliers
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Suppliers can insert their own business data
CREATE POLICY "suppliers_insert_own_data" ON public.suppliers
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Public can view only active suppliers
CREATE POLICY "public_view_active_suppliers" ON public.suppliers
    FOR SELECT 
    USING (is_active = true);

-- PRODUCTS TABLE POLICIES
-- Public can view only available products from active suppliers
CREATE POLICY "public_view_available_products" ON public.products
    FOR SELECT 
    USING (
        is_available = true 
        AND supplier_id IN (
            SELECT id FROM public.suppliers 
            WHERE is_active = true
        )
    );

-- Suppliers can manage their own products
CREATE POLICY "suppliers_manage_own_products" ON public.products
    FOR ALL 
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.suppliers 
            WHERE id = supplier_id
        )
    )
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.suppliers 
            WHERE id = supplier_id
        )
    );

-- ORDERS TABLE POLICIES
-- Customers can view only their own orders
CREATE POLICY "customers_view_own_orders" ON public.orders
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Customers can create their own orders
CREATE POLICY "customers_create_own_orders" ON public.orders
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Customers can update their own orders (only before confirmation)
CREATE POLICY "customers_update_own_orders" ON public.orders
    FOR UPDATE 
    USING (auth.uid() = user_id AND status = 'pending')
    WITH CHECK (auth.uid() = user_id);

-- Suppliers can view orders for their business
CREATE POLICY "suppliers_view_business_orders" ON public.orders
    FOR SELECT 
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.suppliers 
            WHERE id = supplier_id
        )
    );

-- Suppliers can update orders for their business (status changes)
CREATE POLICY "suppliers_update_business_orders" ON public.orders
    FOR UPDATE 
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.suppliers 
            WHERE id = supplier_id
        )
    )
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.suppliers 
            WHERE id = supplier_id
        )
    );

-- ORDER ITEMS TABLE POLICIES
-- Users can view order items for their own orders
CREATE POLICY "users_view_own_order_items" ON public.order_items
    FOR SELECT 
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.orders 
            WHERE id = order_id
        )
    );

-- Users can insert order items for their own orders
CREATE POLICY "users_insert_own_order_items" ON public.order_items
    FOR INSERT 
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.orders 
            WHERE id = order_id
        )
    );

-- Suppliers can view order items for their business orders
CREATE POLICY "suppliers_view_business_order_items" ON public.order_items
    FOR SELECT 
    USING (
        auth.uid() IN (
            SELECT s.user_id 
            FROM public.suppliers s
            JOIN public.orders o ON s.id = o.supplier_id
            WHERE o.id = order_id
        )
    );

-- CATEGORIES TABLE POLICIES
-- Public can view all active categories
CREATE POLICY "public_view_categories" ON public.categories
    FOR SELECT 
    USING (is_active = true);

-- FEATURED SLOTS TABLE POLICIES
-- Public can view active featured slots
CREATE POLICY "public_view_featured_slots" ON public.featured_slots
    FOR SELECT 
    USING (
        is_active = true 
        AND start_date <= now() 
        AND end_date >= now()
    );

-- Suppliers can manage their own featured slots
CREATE POLICY "suppliers_manage_featured_slots" ON public.featured_slots
    FOR ALL 
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.suppliers 
            WHERE id = supplier_id
        )
    )
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.suppliers 
            WHERE id = supplier_id
        )
    );

-- SUBSCRIPTIONS TABLE POLICIES
-- Suppliers can view their own subscriptions
CREATE POLICY "suppliers_view_own_subscriptions" ON public.subscriptions
    FOR SELECT 
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.suppliers 
            WHERE id = supplier_id
        )
    );

-- Suppliers can update their own subscriptions
CREATE POLICY "suppliers_update_own_subscriptions" ON public.subscriptions
    FOR UPDATE 
    USING (
        auth.uid() IN (
            SELECT user_id FROM public.suppliers 
            WHERE id = supplier_id
        )
    )
    WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.suppliers 
            WHERE id = supplier_id
        )
    );