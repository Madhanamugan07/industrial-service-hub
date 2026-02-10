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
      customer_machines: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          machine_id: string
          purchase_date: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          machine_id: string
          purchase_date?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          machine_id?: string
          purchase_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_machines_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_machines_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          id: string
          machine_name: string
          name: string
          previous_service_date: string | null
          purchase_date: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          machine_name: string
          name: string
          previous_service_date?: string | null
          purchase_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          machine_name?: string
          name?: string
          previous_service_date?: string | null
          purchase_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      machines: {
        Row: {
          created_at: string
          id: string
          machine_id: string
          machine_name: string
          model_number: string
        }
        Insert: {
          created_at?: string
          id?: string
          machine_id: string
          machine_name: string
          model_number: string
        }
        Update: {
          created_at?: string
          id?: string
          machine_id?: string
          machine_name?: string
          model_number?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      service_persons: {
        Row: {
          contact_details: string | null
          created_at: string
          id: string
          name: string
          photo_url: string | null
          service_person_id: string
          user_id: string | null
        }
        Insert: {
          contact_details?: string | null
          created_at?: string
          id?: string
          name: string
          photo_url?: string | null
          service_person_id: string
          user_id?: string | null
        }
        Update: {
          contact_details?: string | null
          created_at?: string
          id?: string
          name?: string
          photo_url?: string | null
          service_person_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      service_tickets: {
        Row: {
          assigned_service_person_id: string | null
          created_at: string
          customer_id: string | null
          id: string
          inspection_image_url: string | null
          machine_id: string | null
          problem_description: string
          problem_image_url: string | null
          repaired_image_url: string | null
          service_report: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_service_person_id?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          inspection_image_url?: string | null
          machine_id?: string | null
          problem_description: string
          problem_image_url?: string | null
          repaired_image_url?: string | null
          service_report?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_service_person_id?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          inspection_image_url?: string | null
          machine_id?: string | null
          problem_description?: string
          problem_image_url?: string | null
          repaired_image_url?: string | null
          service_report?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_tickets_assigned_service_person_id_fkey"
            columns: ["assigned_service_person_id"]
            isOneToOne: false
            referencedRelation: "service_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_tickets_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_tickets_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
        ]
      }
      spare_parts: {
        Row: {
          created_at: string
          id: string
          quantity: number
          spare_part_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          quantity?: number
          spare_part_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          quantity?: number
          spare_part_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      ticket_spare_parts: {
        Row: {
          created_at: string
          id: string
          quantity_used: number
          spare_part_id: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          quantity_used?: number
          spare_part_id: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          quantity_used?: number
          spare_part_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_spare_parts_spare_part_id_fkey"
            columns: ["spare_part_id"]
            isOneToOne: false
            referencedRelation: "spare_parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_spare_parts_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "service_tickets"
            referencedColumns: ["id"]
          },
        ]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_exists: { Args: never; Returns: boolean }
      get_user_role: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_sp_assigned_to_customer_ticket: {
        Args: { _customer_user_id: string; _sp_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "service_person" | "customer"
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
      app_role: ["admin", "service_person", "customer"],
    },
  },
} as const
