export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blockchain_transactions: {
        Row: {
          amount: number
          block_number: number | null
          blockchain: string
          confirmations: number | null
          confirmed_at: string | null
          detected_at: string
          from_address: string
          id: string
          payment_order_id: string | null
          to_address: string
          transaction_hash: string
        }
        Insert: {
          amount: number
          block_number?: number | null
          blockchain: string
          confirmations?: number | null
          confirmed_at?: string | null
          detected_at?: string
          from_address: string
          id?: string
          payment_order_id?: string | null
          to_address: string
          transaction_hash: string
        }
        Update: {
          amount?: number
          block_number?: number | null
          blockchain?: string
          confirmations?: number | null
          confirmed_at?: string | null
          detected_at?: string
          from_address?: string
          id?: string
          payment_order_id?: string | null
          to_address?: string
          transaction_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "blockchain_transactions_payment_order_id_fkey"
            columns: ["payment_order_id"]
            isOneToOne: false
            referencedRelation: "credit_payment_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_payment_orders: {
        Row: {
          blockchain: string
          confirmed_at: string | null
          created_at: string
          credit_amount: number
          expires_at: string
          id: string
          payment_address: string
          status: string
          transaction_hash: string | null
          updated_at: string
          usdc_amount: number
          user_id: string
          wallet_address: string
        }
        Insert: {
          blockchain: string
          confirmed_at?: string | null
          created_at?: string
          credit_amount: number
          expires_at?: string
          id?: string
          payment_address: string
          status?: string
          transaction_hash?: string | null
          updated_at?: string
          usdc_amount: number
          user_id: string
          wallet_address: string
        }
        Update: {
          blockchain?: string
          confirmed_at?: string | null
          created_at?: string
          credit_amount?: number
          expires_at?: string
          id?: string
          payment_address?: string
          status?: string
          transaction_hash?: string | null
          updated_at?: string
          usdc_amount?: number
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          completed_at: string | null
          created_at: string
          description: string | null
          game_session_id: string | null
          id: string
          metadata: Json | null
          reference_id: string | null
          status: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          completed_at?: string | null
          created_at?: string
          description?: string | null
          game_session_id?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          status?: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          completed_at?: string | null
          created_at?: string
          description?: string | null
          game_session_id?: string | null
          id?: string
          metadata?: Json | null
          reference_id?: string | null
          status?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_transactions_game_session_id_fkey"
            columns: ["game_session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          credits_earned: number
          credits_spent: number
          duration_seconds: number
          game_type: string
          id: string
          pipes_passed: number
          score: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          credits_earned?: number
          credits_spent?: number
          duration_seconds?: number
          game_type?: string
          id?: string
          pipes_passed?: number
          score?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          credits_earned?: number
          credits_spent?: number
          duration_seconds?: number
          game_type?: string
          id?: string
          pipes_passed?: number
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      nft_holdings: {
        Row: {
          acquired_at: string | null
          blockchain: Database["public"]["Enums"]["blockchain_type"]
          collection_name: string
          id: string
          image_url: string | null
          is_staked: boolean | null
          nft_id: string
          token_name: string | null
          user_id: string
        }
        Insert: {
          acquired_at?: string | null
          blockchain: Database["public"]["Enums"]["blockchain_type"]
          collection_name: string
          id?: string
          image_url?: string | null
          is_staked?: boolean | null
          nft_id: string
          token_name?: string | null
          user_id: string
        }
        Update: {
          acquired_at?: string | null
          blockchain?: Database["public"]["Enums"]["blockchain_type"]
          collection_name?: string
          id?: string
          image_url?: string | null
          is_staked?: boolean | null
          nft_id?: string
          token_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      staking_pools: {
        Row: {
          apy_percentage: number
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          lock_period_days: number | null
          min_stake_amount: number | null
          name: string
          token_symbol: string
        }
        Insert: {
          apy_percentage: number
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          lock_period_days?: number | null
          min_stake_amount?: number | null
          name: string
          token_symbol: string
        }
        Update: {
          apy_percentage?: number
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          lock_period_days?: number | null
          min_stake_amount?: number | null
          name?: string
          token_symbol?: string
        }
        Relationships: []
      }
      staking_rewards: {
        Row: {
          claim_date: string | null
          claimed: boolean | null
          id: string
          reward_amount: number
          reward_date: string | null
          stake_id: string
          transaction_hash: string | null
          user_id: string
        }
        Insert: {
          claim_date?: string | null
          claimed?: boolean | null
          id?: string
          reward_amount: number
          reward_date?: string | null
          stake_id: string
          transaction_hash?: string | null
          user_id: string
        }
        Update: {
          claim_date?: string | null
          claimed?: boolean | null
          id?: string
          reward_amount?: number
          reward_date?: string | null
          stake_id?: string
          transaction_hash?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staking_rewards_stake_id_fkey"
            columns: ["stake_id"]
            isOneToOne: false
            referencedRelation: "user_stakes"
            referencedColumns: ["id"]
          },
        ]
      }
      token_balances: {
        Row: {
          balance: number
          blockchain: Database["public"]["Enums"]["blockchain_type"]
          id: string
          last_updated: string | null
          token_symbol: string
          user_id: string
        }
        Insert: {
          balance?: number
          blockchain: Database["public"]["Enums"]["blockchain_type"]
          id?: string
          last_updated?: string | null
          token_symbol: string
          user_id: string
        }
        Update: {
          balance?: number
          blockchain?: Database["public"]["Enums"]["blockchain_type"]
          id?: string
          last_updated?: string | null
          token_symbol?: string
          user_id?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_social_accounts: {
        Row: {
          created_at: string | null
          id: string
          platform: Database["public"]["Enums"]["social_platform"]
          profile_url: string | null
          user_id: string
          username: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform: Database["public"]["Enums"]["social_platform"]
          profile_url?: string | null
          user_id: string
          username: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: Database["public"]["Enums"]["social_platform"]
          profile_url?: string | null
          user_id?: string
          username?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      user_stakes: {
        Row: {
          amount: number
          created_at: string | null
          end_date: string | null
          id: string
          pool_id: string
          start_date: string | null
          status: Database["public"]["Enums"]["stake_status"] | null
          transaction_hash: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          end_date?: string | null
          id?: string
          pool_id: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["stake_status"] | null
          transaction_hash?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          end_date?: string | null
          id?: string
          pool_id?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["stake_status"] | null
          transaction_hash?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stakes_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "staking_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      user_wallets: {
        Row: {
          blockchain: Database["public"]["Enums"]["blockchain_type"]
          created_at: string | null
          id: string
          is_primary: boolean | null
          updated_at: string | null
          user_id: string
          wallet_address: string
          wallet_name: string | null
        }
        Insert: {
          blockchain: Database["public"]["Enums"]["blockchain_type"]
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          updated_at?: string | null
          user_id: string
          wallet_address: string
          wallet_name?: string | null
        }
        Update: {
          blockchain?: Database["public"]["Enums"]["blockchain_type"]
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          updated_at?: string | null
          user_id?: string
          wallet_address?: string
          wallet_name?: string | null
        }
        Relationships: []
      }
      wallet_verifications: {
        Row: {
          blockchain: Database["public"]["Enums"]["blockchain_type"]
          created_at: string
          credits_awarded: number
          id: string
          memecoin_count: number | null
          nft_count: number | null
          user_id: string
          verification_type: string
          verified_at: string
          wallet_address: string
        }
        Insert: {
          blockchain: Database["public"]["Enums"]["blockchain_type"]
          created_at?: string
          credits_awarded?: number
          id?: string
          memecoin_count?: number | null
          nft_count?: number | null
          user_id: string
          verification_type: string
          verified_at?: string
          wallet_address: string
        }
        Update: {
          blockchain?: Database["public"]["Enums"]["blockchain_type"]
          created_at?: string
          credits_awarded?: number
          id?: string
          memecoin_count?: number | null
          nft_count?: number | null
          user_id?: string
          verification_type?: string
          verified_at?: string
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard_stats: {
        Row: {
          average_score: number | null
          full_name: string | null
          highest_score: number | null
          last_played: string | null
          longest_survival: number | null
          total_credits_earned: number | null
          total_games: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      process_confirmed_payment: {
        Args: { payment_order_id: string; transaction_hash: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      blockchain_type: "cardano" | "sui" | "ethereum" | "bitcoin"
      social_platform:
        | "twitter"
        | "discord"
        | "telegram"
        | "instagram"
        | "youtube"
      stake_status: "active" | "pending" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      blockchain_type: ["cardano", "sui", "ethereum", "bitcoin"],
      social_platform: [
        "twitter",
        "discord",
        "telegram",
        "instagram",
        "youtube",
      ],
      stake_status: ["active", "pending", "completed", "cancelled"],
    },
  },
} as const
