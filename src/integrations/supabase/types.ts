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
      calc_consumables: {
        Row: {
          cost: number
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cost?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cost?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      calc_electricity_settings: {
        Row: {
          contracted_power_kva: number | null
          created_at: string | null
          daily_fixed_cost: number | null
          id: string
          is_default: boolean | null
          name: string
          notes: string | null
          price_per_kwh: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contracted_power_kva?: number | null
          created_at?: string | null
          daily_fixed_cost?: number | null
          id?: string
          is_default?: boolean | null
          name: string
          notes?: string | null
          price_per_kwh?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contracted_power_kva?: number | null
          created_at?: string | null
          daily_fixed_cost?: number | null
          id?: string
          is_default?: boolean | null
          name?: string
          notes?: string | null
          price_per_kwh?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      calc_filaments: {
        Row: {
          brand: string | null
          color: string | null
          created_at: string | null
          density: number | null
          id: string
          is_active: boolean | null
          material: string
          name: string
          notes: string | null
          spool_cost: number
          spool_weight_grams: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brand?: string | null
          color?: string | null
          created_at?: string | null
          density?: number | null
          id?: string
          is_active?: boolean | null
          material?: string
          name: string
          notes?: string | null
          spool_cost?: number
          spool_weight_grams?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brand?: string | null
          color?: string | null
          created_at?: string | null
          density?: number | null
          id?: string
          is_active?: boolean | null
          material?: string
          name?: string
          notes?: string | null
          spool_cost?: number
          spool_weight_grams?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      calc_fixed_expenses: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          monthly_amount: number
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          monthly_amount?: number
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          monthly_amount?: number
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      calc_labor_settings: {
        Row: {
          created_at: string | null
          default_minutes_per_print: number | null
          hourly_rate: number
          id: string
          include_in_cost: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          default_minutes_per_print?: number | null
          hourly_rate?: number
          id?: string
          include_in_cost?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          default_minutes_per_print?: number | null
          hourly_rate?: number
          id?: string
          include_in_cost?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      calc_print_consumables: {
        Row: {
          consumable_id: string
          created_at: string | null
          id: string
          print_id: string
        }
        Insert: {
          consumable_id: string
          created_at?: string | null
          id?: string
          print_id: string
        }
        Update: {
          consumable_id?: string
          created_at?: string | null
          id?: string
          print_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calc_print_consumables_consumable_id_fkey"
            columns: ["consumable_id"]
            isOneToOne: false
            referencedRelation: "calc_consumables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calc_print_consumables_print_id_fkey"
            columns: ["print_id"]
            isOneToOne: false
            referencedRelation: "calc_prints"
            referencedColumns: ["id"]
          },
        ]
      }
      calc_print_expenses: {
        Row: {
          created_at: string | null
          expense_id: string
          id: string
          print_id: string
        }
        Insert: {
          created_at?: string | null
          expense_id: string
          id?: string
          print_id: string
        }
        Update: {
          created_at?: string | null
          expense_id?: string
          id?: string
          print_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calc_print_expenses_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "calc_fixed_expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calc_print_expenses_print_id_fkey"
            columns: ["print_id"]
            isOneToOne: false
            referencedRelation: "calc_prints"
            referencedColumns: ["id"]
          },
        ]
      }
      calc_print_filaments: {
        Row: {
          created_at: string | null
          filament_id: string
          grams_used: number
          id: string
          print_id: string
        }
        Insert: {
          created_at?: string | null
          filament_id: string
          grams_used?: number
          id?: string
          print_id: string
        }
        Update: {
          created_at?: string | null
          filament_id?: string
          grams_used?: number
          id?: string
          print_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calc_print_filaments_filament_id_fkey"
            columns: ["filament_id"]
            isOneToOne: false
            referencedRelation: "calc_filaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calc_print_filaments_print_id_fkey"
            columns: ["print_id"]
            isOneToOne: false
            referencedRelation: "calc_prints"
            referencedColumns: ["id"]
          },
        ]
      }
      calc_printers: {
        Row: {
          brand: string | null
          created_at: string | null
          default_electricity_settings_id: string | null
          depreciation_hours: number | null
          depreciation_months: number | null
          id: string
          is_active: boolean | null
          maintenance_cost: number | null
          model: string | null
          name: string
          notes: string | null
          power_watts: number | null
          purchase_cost: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          brand?: string | null
          created_at?: string | null
          default_electricity_settings_id?: string | null
          depreciation_hours?: number | null
          depreciation_months?: number | null
          id?: string
          is_active?: boolean | null
          maintenance_cost?: number | null
          model?: string | null
          name: string
          notes?: string | null
          power_watts?: number | null
          purchase_cost?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          brand?: string | null
          created_at?: string | null
          default_electricity_settings_id?: string | null
          depreciation_hours?: number | null
          depreciation_months?: number | null
          id?: string
          is_active?: boolean | null
          maintenance_cost?: number | null
          model?: string | null
          name?: string
          notes?: string | null
          power_watts?: number | null
          purchase_cost?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calc_printers_default_electricity_settings_id_fkey"
            columns: ["default_electricity_settings_id"]
            isOneToOne: false
            referencedRelation: "calc_electricity_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      calc_prints: {
        Row: {
          consumables_cost: number | null
          created_at: string | null
          depreciation_cost: number | null
          electricity_cost: number | null
          electricity_settings_id: string | null
          failure_rate_percent: number | null
          filament_cost: number | null
          fixed_expenses_cost: number | null
          id: string
          image_url: string | null
          is_template: boolean | null
          labor_cost: number | null
          labor_time_minutes: number | null
          markup_percent: number | null
          model_cost: number | null
          name: string
          notes: string | null
          print_time_minutes: number
          printer_id: string | null
          profit: number | null
          profit_margin_percent: number | null
          quantity: number | null
          sell_price: number | null
          shipping_cost: number | null
          shipping_option_id: string | null
          total_cost: number | null
          updated_at: string | null
          user_id: string
          wastage_percent: number | null
        }
        Insert: {
          consumables_cost?: number | null
          created_at?: string | null
          depreciation_cost?: number | null
          electricity_cost?: number | null
          electricity_settings_id?: string | null
          failure_rate_percent?: number | null
          filament_cost?: number | null
          fixed_expenses_cost?: number | null
          id?: string
          image_url?: string | null
          is_template?: boolean | null
          labor_cost?: number | null
          labor_time_minutes?: number | null
          markup_percent?: number | null
          model_cost?: number | null
          name: string
          notes?: string | null
          print_time_minutes?: number
          printer_id?: string | null
          profit?: number | null
          profit_margin_percent?: number | null
          quantity?: number | null
          sell_price?: number | null
          shipping_cost?: number | null
          shipping_option_id?: string | null
          total_cost?: number | null
          updated_at?: string | null
          user_id: string
          wastage_percent?: number | null
        }
        Update: {
          consumables_cost?: number | null
          created_at?: string | null
          depreciation_cost?: number | null
          electricity_cost?: number | null
          electricity_settings_id?: string | null
          failure_rate_percent?: number | null
          filament_cost?: number | null
          fixed_expenses_cost?: number | null
          id?: string
          image_url?: string | null
          is_template?: boolean | null
          labor_cost?: number | null
          labor_time_minutes?: number | null
          markup_percent?: number | null
          model_cost?: number | null
          name?: string
          notes?: string | null
          print_time_minutes?: number
          printer_id?: string | null
          profit?: number | null
          profit_margin_percent?: number | null
          quantity?: number | null
          sell_price?: number | null
          shipping_cost?: number | null
          shipping_option_id?: string | null
          total_cost?: number | null
          updated_at?: string | null
          user_id?: string
          wastage_percent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "calc_prints_electricity_settings_id_fkey"
            columns: ["electricity_settings_id"]
            isOneToOne: false
            referencedRelation: "calc_electricity_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calc_prints_printer_id_fkey"
            columns: ["printer_id"]
            isOneToOne: false
            referencedRelation: "calc_printers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calc_prints_shipping_option_id_fkey"
            columns: ["shipping_option_id"]
            isOneToOne: false
            referencedRelation: "calc_shipping_options"
            referencedColumns: ["id"]
          },
        ]
      }
      calc_shipping_options: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      calc_vat_settings: {
        Row: {
          created_at: string | null
          id: string
          show_vat_in_calculator: boolean | null
          updated_at: string | null
          user_id: string
          vat_rate: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          show_vat_in_calculator?: boolean | null
          updated_at?: string | null
          user_id: string
          vat_rate?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          show_vat_in_calculator?: boolean | null
          updated_at?: string | null
          user_id?: string
          vat_rate?: number | null
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      content_translations: {
        Row: {
          content_key: string
          content_type: string
          created_at: string | null
          description: string | null
          english_text: string
          id: string
          page: string
          portuguese_text: string | null
          section: string
          updated_at: string | null
        }
        Insert: {
          content_key: string
          content_type?: string
          created_at?: string | null
          description?: string | null
          english_text: string
          id?: string
          page: string
          portuguese_text?: string | null
          section: string
          updated_at?: string | null
        }
        Update: {
          content_key?: string
          content_type?: string
          created_at?: string | null
          description?: string | null
          english_text?: string
          id?: string
          page?: string
          portuguese_text?: string | null
          section?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      designs: {
        Row: {
          blend_file_url: string | null
          car_model: string | null
          car_year: number | null
          category: string | null
          created_at: string
          depth: number | null
          height: number | null
          home_decoration_type: string | null
          id: string
          is_favorited: boolean | null
          material: string | null
          part_name: string | null
          prompt_text: string
          review_notes: string | null
          review_status: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          stl_file_url: string | null
          user_id: string
          width: number | null
        }
        Insert: {
          blend_file_url?: string | null
          car_model?: string | null
          car_year?: number | null
          category?: string | null
          created_at?: string
          depth?: number | null
          height?: number | null
          home_decoration_type?: string | null
          id?: string
          is_favorited?: boolean | null
          material?: string | null
          part_name?: string | null
          prompt_text: string
          review_notes?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          stl_file_url?: string | null
          user_id: string
          width?: number | null
        }
        Update: {
          blend_file_url?: string | null
          car_model?: string | null
          car_year?: number | null
          category?: string | null
          created_at?: string
          depth?: number | null
          height?: number | null
          home_decoration_type?: string | null
          id?: string
          is_favorited?: boolean | null
          material?: string | null
          part_name?: string | null
          prompt_text?: string
          review_notes?: string | null
          review_status?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          stl_file_url?: string | null
          user_id?: string
          width?: number | null
        }
        Relationships: []
      }
      generation_costs: {
        Row: {
          cost_usd: number
          created_at: string | null
          design_id: string | null
          id: string
          service: string
          status: string
          user_id: string
        }
        Insert: {
          cost_usd: number
          created_at?: string | null
          design_id?: string | null
          id?: string
          service: string
          status?: string
          user_id: string
        }
        Update: {
          cost_usd?: number
          created_at?: string | null
          design_id?: string | null
          id?: string
          service?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generation_costs_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price_at_purchase: number
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price_at_purchase: number
          product_id: string
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price_at_purchase?: number
          product_id?: string
          quantity?: number
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
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          guest_email: string | null
          guest_name: string | null
          id: string
          is_guest_order: boolean | null
          shipping_address: Json
          status: string
          stripe_session_id: string | null
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          is_guest_order?: boolean | null
          shipping_address: Json
          status?: string
          stripe_session_id?: string | null
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          is_guest_order?: boolean | null
          shipping_address?: Json
          status?: string
          stripe_session_id?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          design_id: string | null
          id: string
          metadata: Json | null
          payment_method: string
          payment_reference: string | null
          payment_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          design_id?: string | null
          id?: string
          metadata?: Json | null
          payment_method: string
          payment_reference?: string | null
          payment_status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          design_id?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string
          payment_reference?: string | null
          payment_status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tags: {
        Row: {
          created_at: string
          product_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          product_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          product_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number | null
          calc_print_id: string | null
          category: string
          cost_price: number | null
          created_at: string
          depth: number | null
          description: string | null
          discount_enabled: boolean | null
          discount_percent: number | null
          height: number | null
          id: string
          images: string[] | null
          is_active: boolean
          material: string | null
          name: string
          price: number
          sales_count: number
          stock_quantity: number
          updated_at: string
          view_count: number
          width: number | null
        }
        Insert: {
          base_price?: number | null
          calc_print_id?: string | null
          category: string
          cost_price?: number | null
          created_at?: string
          depth?: number | null
          description?: string | null
          discount_enabled?: boolean | null
          discount_percent?: number | null
          height?: number | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          material?: string | null
          name: string
          price: number
          sales_count?: number
          stock_quantity?: number
          updated_at?: string
          view_count?: number
          width?: number | null
        }
        Update: {
          base_price?: number | null
          calc_print_id?: string | null
          category?: string
          cost_price?: number | null
          created_at?: string
          depth?: number | null
          description?: string | null
          discount_enabled?: boolean | null
          discount_percent?: number | null
          height?: number | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          material?: string | null
          name?: string
          price?: number
          sales_count?: number
          stock_quantity?: number
          updated_at?: string
          view_count?: number
          width?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string
          phone: string | null
          postal_code: string | null
          updated_at: string
          vat_number: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          id: string
          last_name: string
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
          vat_number?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          postal_code?: string | null
          updated_at?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      rate_limit_requests: {
        Row: {
          action: string
          created_at: string
          id: string
          identifier: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          identifier: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          identifier?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          description_en: string | null
          description_pt: string | null
          id: string
          is_featured: boolean
          name_en: string
          name_pt: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_en?: string | null
          description_pt?: string | null
          id?: string
          is_featured?: boolean
          name_en: string
          name_pt: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_en?: string | null
          description_pt?: string | null
          id?: string
          is_featured?: boolean
          name_en?: string
          name_pt?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      uploads: {
        Row: {
          created_at: string
          design_id: string | null
          file_type: string
          file_url: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          design_id?: string | null
          file_type: string
          file_url: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          design_id?: string | null
          file_type?: string
          file_url?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "uploads_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credits: {
        Row: {
          created_at: string | null
          credits_purchased: number
          credits_remaining: number
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_purchased?: number
          credits_remaining?: number
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_purchased?: number
          credits_remaining?: number
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string
          design_id: string | null
          id: string
          product_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          design_id?: string | null
          id?: string
          product_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          design_id?: string | null
          id?: string
          product_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_action: string
          p_identifier: string
          p_max_requests?: number
          p_window_seconds?: number
        }
        Returns: boolean
      }
      cleanup_rate_limit_requests: { Args: never; Returns: undefined }
      decrement_user_credits: {
        Args: { p_amount: number; p_user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_product_sales: {
        Args: { p_product_id: string; p_quantity?: number }
        Returns: undefined
      }
      increment_product_view: {
        Args: { p_product_id: string }
        Returns: undefined
      }
      increment_user_credits: {
        Args: { p_amount: number; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "creator" | "user"
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
      app_role: ["admin", "creator", "user"],
    },
  },
} as const
