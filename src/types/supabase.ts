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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ads: {
        Row: {
          address: string | null
          category_id: number | null
          city_id: number | null
          condition_text: string | null
          created_at: string
          description: string
          district: string | null
          geo_lat: number | null
          geo_lon: number | null
          id: number
          is_gift: boolean
          photos: Json
          price: number | null
          status: string
          story_reason: string | null
          story_text: string | null
          title: string
          updated_at: string
          user_id: string
          views: number
          voice_url: string | null
        }
        Insert: {
          address?: string | null
          category_id?: number | null
          city_id?: number | null
          condition_text?: string | null
          created_at?: string
          description?: string
          district?: string | null
          geo_lat?: number | null
          geo_lon?: number | null
          id?: number
          is_gift?: boolean
          photos?: Json
          price?: number | null
          status?: string
          story_reason?: string | null
          story_text?: string | null
          title: string
          updated_at?: string
          user_id: string
          views?: number
          voice_url?: string | null
        }
        Update: {
          address?: string | null
          category_id?: number | null
          city_id?: number | null
          condition_text?: string | null
          created_at?: string
          description?: string
          district?: string | null
          geo_lat?: number | null
          geo_lon?: number | null
          id?: number
          is_gift?: boolean
          photos?: Json
          price?: number | null
          status?: string
          story_reason?: string | null
          story_text?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          views?: number
          voice_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ads_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          icon: string
          id: number
          name: string
          name_ru: string
          parent_id: number | null
          sort_order: number
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: number
          name: string
          name_ru: string
          parent_id?: number | null
          sort_order?: number
        }
        Update: {
          created_at?: string
          icon?: string
          id?: number
          name?: string
          name_ru?: string
          parent_id?: number | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          center_lat: number
          center_lon: number
          created_at: string
          id: number
          is_active: boolean
          name: string
          region: string
          slug: string
        }
        Insert: {
          center_lat?: number
          center_lon?: number
          created_at?: string
          id?: number
          is_active?: boolean
          name: string
          region?: string
          slug: string
        }
        Update: {
          center_lat?: number
          center_lon?: number
          created_at?: string
          id?: number
          is_active?: boolean
          name?: string
          region?: string
          slug?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          ad_id: number | null
          buyer_id: string
          buyer_unread: number
          created_at: string
          id: number
          last_message: string | null
          last_message_at: string | null
          seller_id: string
          seller_unread: number
        }
        Insert: {
          ad_id?: number | null
          buyer_id: string
          buyer_unread?: number
          created_at?: string
          id?: number
          last_message?: string | null
          last_message_at?: string | null
          seller_id: string
          seller_unread?: number
        }
        Update: {
          ad_id?: number | null
          buyer_id?: string
          buyer_unread?: number
          created_at?: string
          id?: number
          last_message?: string | null
          last_message_at?: string | null
          seller_id?: string
          seller_unread?: number
        }
        Relationships: [
          {
            foreignKeyName: "conversations_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      districts: {
        Row: {
          area: string | null
          center_lat: number | null
          center_lon: number | null
          city_id: number | null
          created_at: string | null
          id: number
          is_active: boolean | null
          name: string
        }
        Insert: {
          area?: string | null
          center_lat?: number | null
          center_lon?: number | null
          city_id?: number | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name: string
        }
        Update: {
          area?: string | null
          center_lat?: number | null
          center_lon?: number | null
          city_id?: number | null
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "districts_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          ad_id: number
          created_at: string
          id: number
          user_id: string
        }
        Insert: {
          ad_id: number
          created_at?: string
          id?: number
          user_id: string
        }
        Update: {
          ad_id?: number
          created_at?: string
          id?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          conversation_id: number
          created_at: string
          id: number
          is_read: boolean
          sender_id: string
          text: string
        }
        Insert: {
          conversation_id: number
          created_at?: string
          id?: number
          is_read?: boolean
          sender_id: string
          text: string
        }
        Update: {
          conversation_id?: number
          created_at?: string
          id?: number
          is_read?: boolean
          sender_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          ad_id: number
          amount: number
          buyer_id: string
          created_at: string
          id: number
          seller_id: string
          status: string
          updated_at: string
        }
        Insert: {
          ad_id: number
          amount: number
          buyer_id: string
          created_at?: string
          id?: number
          seller_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          ad_id?: number
          amount?: number
          buyer_id?: string
          created_at?: string
          id?: number
          seller_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          badges: Json
          city_id: number | null
          created_at: string
          deals_count: number
          home_district: string | null
          id: string
          is_verified: boolean
          name: string
          phone: string | null
          rating: number
          updated_at: string
          voice_intro_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          badges?: Json
          city_id?: number | null
          created_at?: string
          deals_count?: number
          home_district?: string | null
          id: string
          is_verified?: boolean
          name?: string
          phone?: string | null
          rating?: number
          updated_at?: string
          voice_intro_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          badges?: Json
          city_id?: number | null
          created_at?: string
          deals_count?: number
          home_district?: string | null
          id?: string
          is_verified?: boolean
          name?: string
          phone?: string | null
          rating?: number
          updated_at?: string
          voice_intro_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      earth: { Args: never; Returns: number }
      find_district_by_point: {
        Args: { point_lat: number; point_lon: number }
        Returns: Json
      }
      increment_ad_views: { Args: { ad_id: number }; Returns: undefined }
      nearby_ads: {
        Args: { lat: number; lon: number; radius_km?: number }
        Returns: {
          address: string | null
          category_id: number | null
          city_id: number | null
          condition_text: string | null
          created_at: string
          description: string
          district: string | null
          geo_lat: number | null
          geo_lon: number | null
          id: number
          is_gift: boolean
          photos: Json
          price: number | null
          status: string
          story_reason: string | null
          story_text: string | null
          title: string
          updated_at: string
          user_id: string
          views: number
          voice_url: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "ads"
          isOneToOne: false
          isSetofReturn: true
        }
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
