export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          name_ar: string | null
          name_en: string
          parent_category_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          name_ar?: string | null
          name_en: string
          parent_category_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          name_ar?: string | null
          name_en?: string
          parent_category_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "categories_with_products"
            referencedColumns: ["id"]
          },
        ]
      }
      featured_slots: {
        Row: {
          click_count: number | null
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          image_url: string | null
          is_active: boolean | null
          position: number
          slot_type: string | null
          start_date: string
          supplier_id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          click_count?: number | null
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          position: number
          slot_type?: string | null
          start_date: string
          supplier_id: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          click_count?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          position?: number
          slot_type?: string | null
          start_date?: string
          supplier_id?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "featured_slots_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          product_id: string
          quantity: number
          special_instructions: string | null
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          product_id: string
          quantity: number
          special_instructions?: string | null
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          special_instructions?: string | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "available_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_delivery_time: string | null
          created_at: string | null
          currency: string | null
          delivery_address: string
          delivery_fee: number | null
          delivery_instructions: string | null
          delivery_latitude: number | null
          delivery_longitude: number | null
          discount_amount: number | null
          estimated_delivery_time: string | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string | null
          status: string | null
          subtotal: number
          supplier_id: string
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_delivery_time?: string | null
          created_at?: string | null
          currency?: string | null
          delivery_address: string
          delivery_fee?: number | null
          delivery_instructions?: string | null
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          discount_amount?: number | null
          estimated_delivery_time?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          status?: string | null
          subtotal: number
          supplier_id: string
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_delivery_time?: string | null
          created_at?: string | null
          currency?: string | null
          delivery_address?: string
          delivery_fee?: number | null
          delivery_instructions?: string | null
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          discount_amount?: number | null
          estimated_delivery_time?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          status?: string | null
          subtotal?: number
          supplier_id?: string
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          resource: string | null
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          resource?: string | null
        }
        Update: {
          action?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          resource?: string | null
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name_ar: string | null
          name_en: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string | null
          name_en?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          allergens: string | null
          calories: number | null
          category_id: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          description_ar: string | null
          description_en: string | null
          discounted_price: number | null
          id: string
          image_url: string | null
          images: Json | null
          ingredients: string | null
          is_available: boolean | null
          is_featured: boolean | null
          is_halal: boolean | null
          is_hot_deal: boolean | null
          is_vegan: boolean | null
          is_vegetarian: boolean | null
          max_quantity_per_order: number | null
          name: string
          name_ar: string | null
          name_en: string
          nutritional_info: Json | null
          preparation_time: number | null
          price: number
          sort_order: number | null
          stock_quantity: number | null
          supplier_id: string
          updated_at: string | null
        }
        Insert: {
          allergens?: string | null
          calories?: number | null
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          discounted_price?: number | null
          id?: string
          image_url?: string | null
          images?: Json | null
          ingredients?: string | null
          is_available?: boolean | null
          is_featured?: boolean | null
          is_halal?: boolean | null
          is_hot_deal?: boolean | null
          is_vegan?: boolean | null
          is_vegetarian?: boolean | null
          max_quantity_per_order?: number | null
          name: string
          name_ar?: string | null
          name_en: string
          nutritional_info?: Json | null
          preparation_time?: number | null
          price: number
          sort_order?: number | null
          stock_quantity?: number | null
          supplier_id: string
          updated_at?: string | null
        }
        Update: {
          allergens?: string | null
          calories?: number | null
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          description_ar?: string | null
          description_en?: string | null
          discounted_price?: number | null
          id?: string
          image_url?: string | null
          images?: Json | null
          ingredients?: string | null
          is_available?: boolean | null
          is_featured?: boolean | null
          is_halal?: boolean | null
          is_hot_deal?: boolean | null
          is_vegan?: boolean | null
          is_vegetarian?: boolean | null
          max_quantity_per_order?: number | null
          name?: string
          name_ar?: string | null
          name_en?: string
          nutritional_info?: Json | null
          preparation_time?: number | null
          price?: number
          sort_order?: number | null
          stock_quantity?: number | null
          supplier_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      promotional_slides: {
        Row: {
          button_url: string | null
          created_at: string | null
          description: string | null
          description_ar: string | null
          discount_text: string | null
          discount_text_ar: string | null
          display_order: number
          id: string
          image_url: string
          is_active: boolean
          slide_duration: number | null
          supplier_id: string | null
          title: string
          title_ar: string | null
          updated_at: string | null
        }
        Insert: {
          button_url?: string | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          discount_text?: string | null
          discount_text_ar?: string | null
          display_order?: number
          id?: string
          image_url: string
          is_active?: boolean
          slide_duration?: number | null
          supplier_id?: string | null
          title: string
          title_ar?: string | null
          updated_at?: string | null
        }
        Update: {
          button_url?: string | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          discount_text?: string | null
          discount_text_ar?: string | null
          display_order?: number
          id?: string
          image_url?: string
          is_active?: boolean
          slide_duration?: number | null
          supplier_id?: string | null
          title?: string
          title_ar?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotional_slides_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          commission_rate: number
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          monthly_fee: number
          name: string
          updated_at: string | null
        }
        Insert: {
          commission_rate?: number
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          monthly_fee?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          commission_rate?: number
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          monthly_fee?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          commission_rate: number
          created_at: string | null
          end_date: string
          features: Json | null
          id: string
          last_payment_date: string | null
          monthly_fee: number
          next_payment_date: string | null
          payment_status: string | null
          plan_id: string | null
          plan_type: string | null
          start_date: string
          status: string | null
          supplier_id: string
          updated_at: string | null
        }
        Insert: {
          commission_rate: number
          created_at?: string | null
          end_date: string
          features?: Json | null
          id?: string
          last_payment_date?: string | null
          monthly_fee: number
          next_payment_date?: string | null
          payment_status?: string | null
          plan_id?: string | null
          plan_type?: string | null
          start_date: string
          status?: string | null
          supplier_id: string
          updated_at?: string | null
        }
        Update: {
          commission_rate?: number
          created_at?: string | null
          end_date?: string
          features?: Json | null
          id?: string
          last_payment_date?: string | null
          monthly_fee?: number
          next_payment_date?: string | null
          payment_status?: string | null
          plan_id?: string | null
          plan_type?: string | null
          start_date?: string
          status?: string | null
          supplier_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: true
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string
          address_ar: string | null
          business_hours: Json | null
          business_name: string
          business_name_ar: string | null
          business_type: string | null
          city: string
          cover_image_url: string | null
          created_at: string | null
          cuisine_type: string | null
          delivery_fee: number | null
          delivery_radius_km: number | null
          delivery_time_max: number | null
          delivery_time_min: number | null
          description: string | null
          description_ar: string | null
          email: string | null
          facebook_url: string | null
          google_business_url: string | null
          id: string
          instagram_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          is_verified: boolean | null
          latitude: number
          logo_url: string | null
          longitude: number
          minimum_order: number | null
          phone: string
          phone_secondary: string | null
          postal_code: string | null
          rating: number | null
          subscription_status: string | null
          total_reviews: number | null
          updated_at: string | null
          user_id: string
          website_url: string | null
          youtube_url: string | null
        }
        Insert: {
          address: string
          address_ar?: string | null
          business_hours?: Json | null
          business_name: string
          business_name_ar?: string | null
          business_type?: string | null
          city: string
          cover_image_url?: string | null
          created_at?: string | null
          cuisine_type?: string | null
          delivery_fee?: number | null
          delivery_radius_km?: number | null
          delivery_time_max?: number | null
          delivery_time_min?: number | null
          description?: string | null
          description_ar?: string | null
          email?: string | null
          facebook_url?: string | null
          google_business_url?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          latitude: number
          logo_url?: string | null
          longitude: number
          minimum_order?: number | null
          phone: string
          phone_secondary?: string | null
          postal_code?: string | null
          rating?: number | null
          subscription_status?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id: string
          website_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          address?: string
          address_ar?: string | null
          business_hours?: Json | null
          business_name?: string
          business_name_ar?: string | null
          business_type?: string | null
          city?: string
          cover_image_url?: string | null
          created_at?: string | null
          cuisine_type?: string | null
          delivery_fee?: number | null
          delivery_radius_km?: number | null
          delivery_time_max?: number | null
          delivery_time_min?: number | null
          description?: string | null
          description_ar?: string | null
          email?: string | null
          facebook_url?: string | null
          google_business_url?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          latitude?: number
          logo_url?: string | null
          longitude?: number
          minimum_order?: number | null
          phone?: string
          phone_secondary?: string | null
          postal_code?: string | null
          rating?: number | null
          subscription_status?: string | null
          total_reviews?: number | null
          updated_at?: string | null
          user_id?: string
          website_url?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_business_type_fkey"
            columns: ["business_type"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suppliers_business_type_fkey"
            columns: ["business_type"]
            isOneToOne: false
            referencedRelation: "categories_with_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suppliers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          role_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          role_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          role_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_roles_organization"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          email_verified: boolean | null
          first_name: string
          gender: string | null
          id: string
          is_active: boolean | null
          last_login: string | null
          last_name: string
          latitude: number | null
          longitude: number | null
          phone: string | null
          phone_verified: boolean | null
          postal_code: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          email_verified?: boolean | null
          first_name: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          last_name: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          phone_verified?: boolean | null
          postal_code?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          email_verified?: boolean | null
          first_name?: string
          gender?: string | null
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          last_name?: string
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          phone_verified?: boolean | null
          postal_code?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      active_slideshow: {
        Row: {
          button_url: string | null
          description: string | null
          description_ar: string | null
          discount_text: string | null
          discount_text_ar: string | null
          display_order: number | null
          id: string | null
          image_url: string | null
          slide_duration: number | null
          supplier_name: string | null
          title: string | null
          title_ar: string | null
        }
        Relationships: []
      }
      available_products: {
        Row: {
          category_name: string | null
          description: string | null
          description_ar: string | null
          description_en: string | null
          discounted_price: number | null
          id: string | null
          image_url: string | null
          is_featured: boolean | null
          is_hot_deal: boolean | null
          name: string | null
          name_ar: string | null
          name_en: string | null
          price: number | null
          supplier_logo: string | null
          supplier_name: string | null
        }
        Relationships: []
      }
      categories_with_products: {
        Row: {
          description: string | null
          id: string | null
          image_url: string | null
          name: string | null
          name_ar: string | null
          name_en: string | null
          product_count: number | null
          sort_order: number | null
          supplier_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_reset_supplier_password: {
        Args: { p_new_password: string; p_user_id: string }
        Returns: Json
      }
      approve_supplier: {
        Args: { supplier_id: string }
        Returns: string
      }
      check_category_circular_reference: {
        Args: { category_id: string; parent_id: string }
        Returns: boolean
      }
      get_supplier_contact_for_order: {
        Args: { supplier_id: string }
        Returns: {
          address: string
          business_name: string
          email: string
          phone: string
        }[]
      }
      get_user_permissions: {
        Args: { p_user_id: string }
        Returns: {
          action: string
          from_role: string
          permission_name: string
          resource: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_roles: {
        Args: { p_user_id: string }
        Returns: {
          organization_id: string
          role_description: string
          role_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      nearby_suppliers: {
        Args: { max_distance_km?: number; user_lat: number; user_long: number }
        Returns: {
          address: string
          business_name: string
          business_type: string
          city: string
          description: string
          distance_km: number
          id: string
          latitude: number
          logo_url: string
          longitude: number
          phone: string
        }[]
      }
      reject_supplier: {
        Args: { reason?: string; supplier_id: string }
        Returns: string
      }
      suppliers_by_type: {
        Args: { type_id: string }
        Returns: {
          business_name: string
          city: string
          description: string
          id: string
          logo_url: string
          phone: string
        }[]
      }
      user_has_permission: {
        Args: {
          p_organization_id?: string
          p_permission_name: string
          p_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "customer" | "supplier"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "customer", "supplier"],
    },
  },
} as const
