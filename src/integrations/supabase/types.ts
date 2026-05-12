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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      blog_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string
          category: string
          content: string
          content_ka: string | null
          content_ru: string | null
          created_at: string
          excerpt: string
          excerpt_ka: string | null
          excerpt_ru: string | null
          featured_image_url: string | null
          id: string
          is_published: boolean
          meta_description: string | null
          meta_description_ka: string | null
          meta_description_ru: string | null
          meta_keywords: string | null
          meta_keywords_ka: string | null
          meta_keywords_ru: string | null
          meta_title: string | null
          meta_title_ka: string | null
          meta_title_ru: string | null
          read_time_minutes: number
          slug: string
          title: string
          title_ka: string | null
          title_ru: string | null
          updated_at: string
        }
        Insert: {
          author?: string
          category?: string
          content?: string
          content_ka?: string | null
          content_ru?: string | null
          created_at?: string
          excerpt: string
          excerpt_ka?: string | null
          excerpt_ru?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_description_ka?: string | null
          meta_description_ru?: string | null
          meta_keywords?: string | null
          meta_keywords_ka?: string | null
          meta_keywords_ru?: string | null
          meta_title?: string | null
          meta_title_ka?: string | null
          meta_title_ru?: string | null
          read_time_minutes?: number
          slug: string
          title: string
          title_ka?: string | null
          title_ru?: string | null
          updated_at?: string
        }
        Update: {
          author?: string
          category?: string
          content?: string
          content_ka?: string | null
          content_ru?: string | null
          created_at?: string
          excerpt?: string
          excerpt_ka?: string | null
          excerpt_ru?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_description_ka?: string | null
          meta_description_ru?: string | null
          meta_keywords?: string | null
          meta_keywords_ka?: string | null
          meta_keywords_ru?: string | null
          meta_title?: string | null
          meta_title_ka?: string | null
          meta_title_ru?: string | null
          read_time_minutes?: number
          slug?: string
          title?: string
          title_ka?: string | null
          title_ru?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          message: string
          phone: string | null
          preferred_channels: string[] | null
          property_interest: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          message: string
          phone?: string | null
          preferred_channels?: string[] | null
          property_interest?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string
          phone?: string | null
          preferred_channels?: string[] | null
          property_interest?: string | null
        }
        Relationships: []
      }
      hero_slides: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string
          is_active: boolean
          sort_order: number
          title: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          sort_order?: number
          title?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          sort_order?: number
          title?: string | null
        }
        Relationships: []
      }
      land_plots: {
        Row: {
          created_at: string
          id: string
          name: string
          price: number
          size_sqm: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          price?: number
          size_sqm: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          price?: number
          size_sqm?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      plot_settings: {
        Row: {
          created_at: string
          id: string
          image_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
        }
        Relationships: []
      }
      plot_villa_assignments: {
        Row: {
          id: string
          plot_id: string
          villa_id: string
        }
        Insert: {
          id?: string
          plot_id: string
          villa_id: string
        }
        Update: {
          id?: string
          plot_id?: string
          villa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plot_villa_assignments_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "land_plots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plot_villa_assignments_villa_id_fkey"
            columns: ["villa_id"]
            isOneToOne: false
            referencedRelation: "villas"
            referencedColumns: ["id"]
          },
        ]
      }
      plot_zone_villa_assignments: {
        Row: {
          id: string
          plot_zone_id: string
          villa_id: string
        }
        Insert: {
          id?: string
          plot_zone_id: string
          villa_id: string
        }
        Update: {
          id?: string
          plot_zone_id?: string
          villa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plot_zone_villa_assignments_plot_zone_id_fkey"
            columns: ["plot_zone_id"]
            isOneToOne: false
            referencedRelation: "plot_zones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plot_zone_villa_assignments_villa_id_fkey"
            columns: ["villa_id"]
            isOneToOne: false
            referencedRelation: "villas"
            referencedColumns: ["id"]
          },
        ]
      }
      plot_zones: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          polygon: Json
          price: number | null
          size_sqm: number | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          polygon: Json
          price?: number | null
          size_sqm?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          polygon?: Json
          price?: number | null
          size_sqm?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_renders: {
        Row: {
          created_at: string
          id: string
          image_url: string
          project: string
          sort_order: number
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          project: string
          sort_order?: number
          title?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          project?: string
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      renders: {
        Row: {
          category: string
          created_at: string
          description: string | null
          description_ka: string | null
          description_ru: string | null
          id: string
          image_url: string
          sort_order: number
          title: string
          title_ka: string | null
          title_ru: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          description_ka?: string | null
          description_ru?: string | null
          id?: string
          image_url: string
          sort_order?: number
          title: string
          title_ka?: string | null
          title_ru?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          description_ka?: string | null
          description_ru?: string | null
          id?: string
          image_url?: string
          sort_order?: number
          title?: string
          title_ka?: string | null
          title_ru?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      villa_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_hero: boolean
          sort_order: number
          villa_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_hero?: boolean
          sort_order?: number
          villa_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_hero?: boolean
          sort_order?: number
          villa_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "villa_images_villa_id_fkey"
            columns: ["villa_id"]
            isOneToOne: false
            referencedRelation: "villas"
            referencedColumns: ["id"]
          },
        ]
      }
      villas: {
        Row: {
          balcony_area: number | null
          bathrooms: number
          bedroom_count: number | null
          bedrooms: number
          cadastral_codes: string | null
          ceiling_height: string | null
          condominium: string | null
          created_at: string
          description: string | null
          description_ka: string | null
          description_ru: string | null
          features: Json | null
          id: string
          kitchen: number | null
          living_area: number | null
          living_room: number | null
          name: string
          parking: string | null
          plot_area: number | null
          pool: boolean | null
          position_x: number
          position_y: number
          price: number | null
          rooms_count: number | null
          section: string | null
          sector: string | null
          size_sqm: number
          slug: string | null
          status: Database["public"]["Enums"]["villa_status"]
          technical_room: number | null
          total_area: number | null
          updated_at: string
          view_type: string | null
          wet_point_1: number | null
          wet_point_2: number | null
        }
        Insert: {
          balcony_area?: number | null
          bathrooms: number
          bedroom_count?: number | null
          bedrooms: number
          cadastral_codes?: string | null
          ceiling_height?: string | null
          condominium?: string | null
          created_at?: string
          description?: string | null
          description_ka?: string | null
          description_ru?: string | null
          features?: Json | null
          id?: string
          kitchen?: number | null
          living_area?: number | null
          living_room?: number | null
          name: string
          parking?: string | null
          plot_area?: number | null
          pool?: boolean | null
          position_x?: number
          position_y?: number
          price?: number | null
          rooms_count?: number | null
          section?: string | null
          sector?: string | null
          size_sqm: number
          slug?: string | null
          status?: Database["public"]["Enums"]["villa_status"]
          technical_room?: number | null
          total_area?: number | null
          updated_at?: string
          view_type?: string | null
          wet_point_1?: number | null
          wet_point_2?: number | null
        }
        Update: {
          balcony_area?: number | null
          bathrooms?: number
          bedroom_count?: number | null
          bedrooms?: number
          cadastral_codes?: string | null
          ceiling_height?: string | null
          condominium?: string | null
          created_at?: string
          description?: string | null
          description_ka?: string | null
          description_ru?: string | null
          features?: Json | null
          id?: string
          kitchen?: number | null
          living_area?: number | null
          living_room?: number | null
          name?: string
          parking?: string | null
          plot_area?: number | null
          pool?: boolean | null
          position_x?: number
          position_y?: number
          price?: number | null
          rooms_count?: number | null
          section?: string | null
          sector?: string | null
          size_sqm?: number
          slug?: string | null
          status?: Database["public"]["Enums"]["villa_status"]
          technical_room?: number | null
          total_area?: number | null
          updated_at?: string
          view_type?: string | null
          wet_point_1?: number | null
          wet_point_2?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      villa_status: "available" | "reserved" | "sold"
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
      app_role: ["admin", "moderator", "user"],
      villa_status: ["available", "reserved", "sold"],
    },
  },
} as const
