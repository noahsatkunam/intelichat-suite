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
      ai_provider_audit_log: {
        Row: {
          action: string
          details: Json | null
          id: string
          provider_id: string | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          action: string
          details?: Json | null
          id?: string
          provider_id?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          details?: Json | null
          id?: string
          provider_id?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_provider_audit_log_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_providers: {
        Row: {
          api_key_encrypted: string | null
          base_url: string | null
          created_at: string
          created_by: string | null
          custom_headers: Json | null
          description: string | null
          id: string
          is_active: boolean
          is_healthy: boolean
          last_health_check: string | null
          name: string
          organization_id: string | null
          project_id: string | null
          tenant_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          api_key_encrypted?: string | null
          base_url?: string | null
          created_at?: string
          created_by?: string | null
          custom_headers?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_healthy?: boolean
          last_health_check?: string | null
          name: string
          organization_id?: string | null
          project_id?: string | null
          tenant_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          api_key_encrypted?: string | null
          base_url?: string | null
          created_at?: string
          created_by?: string | null
          custom_headers?: Json | null
          description?: string | null
          id?: string
          is_active?: boolean
          is_healthy?: boolean
          last_health_check?: string | null
          name?: string
          organization_id?: string | null
          project_id?: string | null
          tenant_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_providers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics: {
        Row: {
          id: string
          metadata: Json | null
          metric_type: string
          tenant_id: string
          timestamp: string | null
          value: number
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_type: string
          tenant_id: string
          timestamp?: string | null
          value: number
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_type?: string
          tenant_id?: string
          timestamp?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "analytics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_knowledge: {
        Row: {
          chatbot_id: string
          created_at: string | null
          document_id: string
          id: string
        }
        Insert: {
          chatbot_id: string
          created_at?: string | null
          document_id: string
          id?: string
        }
        Update: {
          chatbot_id?: string
          created_at?: string | null
          document_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_knowledge_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatbot_knowledge_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_tenants: {
        Row: {
          chatbot_id: string
          created_at: string | null
          id: string
          tenant_id: string
        }
        Insert: {
          chatbot_id: string
          created_at?: string | null
          id?: string
          tenant_id: string
        }
        Update: {
          chatbot_id?: string
          created_at?: string | null
          id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_tenants_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatbot_tenants_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbot_usage: {
        Row: {
          ai_provider_id: string | null
          chatbot_id: string | null
          error_message: string | null
          id: string
          model_used: string | null
          response_time_ms: number | null
          success: boolean
          timestamp: string
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          ai_provider_id?: string | null
          chatbot_id?: string | null
          error_message?: string | null
          id?: string
          model_used?: string | null
          response_time_ms?: number | null
          success?: boolean
          timestamp?: string
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          ai_provider_id?: string | null
          chatbot_id?: string | null
          error_message?: string | null
          id?: string
          model_used?: string | null
          response_time_ms?: number | null
          success?: boolean
          timestamp?: string
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_usage_ai_provider_id_fkey"
            columns: ["ai_provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatbot_usage_chatbot_id_fkey"
            columns: ["chatbot_id"]
            isOneToOne: false
            referencedRelation: "chatbots"
            referencedColumns: ["id"]
          },
        ]
      }
      chatbots: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          fallback_ai_provider_id: string | null
          fallback_model_name: string | null
          frequency_penalty: number | null
          id: string
          is_active: boolean
          max_tokens: number | null
          model_name: string | null
          name: string
          presence_penalty: number | null
          primary_ai_provider_id: string | null
          system_prompt: string | null
          temperature: number | null
          tenant_id: string
          top_p: number | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          fallback_ai_provider_id?: string | null
          fallback_model_name?: string | null
          frequency_penalty?: number | null
          id?: string
          is_active?: boolean
          max_tokens?: number | null
          model_name?: string | null
          name: string
          presence_penalty?: number | null
          primary_ai_provider_id?: string | null
          system_prompt?: string | null
          temperature?: number | null
          tenant_id: string
          top_p?: number | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          fallback_ai_provider_id?: string | null
          fallback_model_name?: string | null
          frequency_penalty?: number | null
          id?: string
          is_active?: boolean
          max_tokens?: number | null
          model_name?: string | null
          name?: string
          presence_penalty?: number | null
          primary_ai_provider_id?: string | null
          system_prompt?: string | null
          temperature?: number | null
          tenant_id?: string
          top_p?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chatbots_fallback_ai_provider_id_fkey"
            columns: ["fallback_ai_provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatbots_primary_ai_provider_id_fkey"
            columns: ["primary_ai_provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chatbots_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          tenant_id: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          tenant_id: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          tenant_id?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      document_tenants: {
        Row: {
          created_at: string | null
          document_id: string
          id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          document_id: string
          id?: string
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          document_id?: string
          id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_tenants_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_tenants_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string | null
          created_at: string | null
          file_url: string | null
          filename: string
          id: string
          notes: string | null
          status: string | null
          tenant_id: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          file_url?: string | null
          filename: string
          id?: string
          notes?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          file_url?: string | null
          filename?: string
          id?: string
          notes?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          id: string
          metadata: Json | null
          role: string
          timestamp: string | null
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          id?: string
          metadata?: Json | null
          role: string
          timestamp?: string | null
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          id?: string
          metadata?: Json | null
          role?: string
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string
          first_name: string | null
          id: string
          invitation_accepted_at: string | null
          invited_by: string | null
          last_name: string | null
          name: string | null
          role: Database["public"]["Enums"]["app_role"] | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          first_name?: string | null
          id: string
          invitation_accepted_at?: string | null
          invited_by?: string | null
          last_name?: string | null
          name?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          first_name?: string | null
          id?: string
          invitation_accepted_at?: string | null
          invited_by?: string | null
          last_name?: string | null
          name?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_models: {
        Row: {
          cost_per_1k_input_tokens: number | null
          cost_per_1k_output_tokens: number | null
          created_at: string | null
          description: string | null
          display_name: string
          id: string
          is_deprecated: boolean | null
          max_context_length: number | null
          model_name: string
          provider_type: string
          supports_function_calling: boolean | null
          supports_vision: boolean | null
          updated_at: string | null
        }
        Insert: {
          cost_per_1k_input_tokens?: number | null
          cost_per_1k_output_tokens?: number | null
          created_at?: string | null
          description?: string | null
          display_name: string
          id?: string
          is_deprecated?: boolean | null
          max_context_length?: number | null
          model_name: string
          provider_type: string
          supports_function_calling?: boolean | null
          supports_vision?: boolean | null
          updated_at?: string | null
        }
        Update: {
          cost_per_1k_input_tokens?: number | null
          cost_per_1k_output_tokens?: number | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          id?: string
          is_deprecated?: boolean | null
          max_context_length?: number | null
          model_name?: string
          provider_type?: string
          supports_function_calling?: boolean | null
          supports_vision?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      provider_usage_stats: {
        Row: {
          created_at: string | null
          date: string
          failed_requests: number | null
          id: string
          provider_id: string | null
          successful_requests: number | null
          total_cost: number | null
          total_requests: number | null
          total_tokens: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date?: string
          failed_requests?: number | null
          id?: string
          provider_id?: string | null
          successful_requests?: number | null
          total_cost?: number | null
          total_requests?: number | null
          total_tokens?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          failed_requests?: number | null
          id?: string
          provider_id?: string | null
          successful_requests?: number | null
          total_cost?: number | null
          total_requests?: number | null
          total_tokens?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_usage_stats_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          ai_generated: boolean
          category: string
          completed: boolean
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          source: string | null
          tenant_id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_generated?: boolean
          category: string
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority: string
          source?: string | null
          tenant_id: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_generated?: boolean
          category?: string
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          source?: string | null
          tenant_id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tenants: {
        Row: {
          branding_config: Json | null
          created_at: string | null
          id: string
          name: string
          settings: Json | null
          subdomain: string
          updated_at: string | null
        }
        Insert: {
          branding_config?: Json | null
          created_at?: string | null
          id?: string
          name: string
          settings?: Json | null
          subdomain: string
          updated_at?: string | null
        }
        Update: {
          branding_config?: Json | null
          created_at?: string | null
          id?: string
          name?: string
          settings?: Json | null
          subdomain?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          metadata: Json | null
          role: Database["public"]["Enums"]["app_role"]
          status: string
          tenant_id: string
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          metadata?: Json | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          tenant_id: string
          token: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          metadata?: Json | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          tenant_id?: string
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          created_at: string
          id: string
          name: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          updated_at: string
        }[]
      }
      get_safe_ai_providers: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          is_active: boolean
          name: string
          tenant_id: string
          type: string
        }[]
      }
      get_safe_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          created_at: string
          id: string
          name: string
          role: Database["public"]["Enums"]["app_role"]
          tenant_id: string
          updated_at: string
        }[]
      }
      get_user_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: { required_role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      is_global_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "global_admin" | "tenant_admin" | "user"
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
      app_role: ["global_admin", "tenant_admin", "user"],
    },
  },
} as const
