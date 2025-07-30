export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_agent_signups: {
        Row: {
          active: boolean | null
          adjectives: string | null
          age: number | null
          agent_name: string | null
          appearance: string | null
          bio: string | null
          cardano_wallet_address: string
          category: string | null
          created_at: string
          crypto_network: string | null
          description: string | null
          email: string
          first_message: string | null
          id: string
          image_url: string | null
          market_cap_value: number | null
          personality: string | null
          platform: string
          policy_id: string | null
          posting_probability: number | null
          ppee_tokens_verified: boolean | null
          response_style: string | null
          social_password: string | null
          social_profile: string | null
          social_username: string | null
          status: string | null
          ticker: string | null
          timeline_reply_probability: number | null
          tone: string | null
          trigger_api_key: string | null
          updated_at: string
          user_id: string
          verified: boolean | null
          voice_model: string | null
          voice_type: string | null
        }
        Insert: {
          active?: boolean | null
          adjectives?: string | null
          age?: number | null
          agent_name?: string | null
          appearance?: string | null
          bio?: string | null
          cardano_wallet_address: string
          category?: string | null
          created_at?: string
          crypto_network?: string | null
          description?: string | null
          email: string
          first_message?: string | null
          id?: string
          image_url?: string | null
          market_cap_value?: number | null
          personality?: string | null
          platform: string
          policy_id?: string | null
          posting_probability?: number | null
          ppee_tokens_verified?: boolean | null
          response_style?: string | null
          social_password?: string | null
          social_profile?: string | null
          social_username?: string | null
          status?: string | null
          ticker?: string | null
          timeline_reply_probability?: number | null
          tone?: string | null
          trigger_api_key?: string | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
          voice_model?: string | null
          voice_type?: string | null
        }
        Update: {
          active?: boolean | null
          adjectives?: string | null
          age?: number | null
          agent_name?: string | null
          appearance?: string | null
          bio?: string | null
          cardano_wallet_address?: string
          category?: string | null
          created_at?: string
          crypto_network?: string | null
          description?: string | null
          email?: string
          first_message?: string | null
          id?: string
          image_url?: string | null
          market_cap_value?: number | null
          personality?: string | null
          platform?: string
          policy_id?: string | null
          posting_probability?: number | null
          ppee_tokens_verified?: boolean | null
          response_style?: string | null
          social_password?: string | null
          social_profile?: string | null
          social_username?: string | null
          status?: string | null
          ticker?: string | null
          timeline_reply_probability?: number | null
          tone?: string | null
          trigger_api_key?: string | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
          voice_model?: string | null
          voice_type?: string | null
        }
        Relationships: []
      }
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
      contact_message_replies: {
        Row: {
          contact_message_id: string
          created_at: string
          id: string
          is_admin_reply: boolean
          message: string
          sender_id: string
        }
        Insert: {
          contact_message_id: string
          created_at?: string
          id?: string
          is_admin_reply?: boolean
          message: string
          sender_id: string
        }
        Update: {
          contact_message_id?: string
          created_at?: string
          id?: string
          is_admin_reply?: boolean
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_message_replies_contact_message_id_fkey"
            columns: ["contact_message_id"]
            isOneToOne: false
            referencedRelation: "contact_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_cashout_requests: {
        Row: {
          admin_notes: string | null
          amount_credits: number
          amount_crypto: number
          approved_at: string | null
          approved_by: string | null
          completed_at: string | null
          created_at: string
          id: string
          new_balance: number
          previous_balance: number
          requested_at: string
          selected_wallet_id: string
          status: string
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount_credits: number
          amount_crypto: number
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          new_balance: number
          previous_balance: number
          requested_at?: string
          selected_wallet_id: string
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount_credits?: number
          amount_crypto?: number
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          new_balance?: number
          previous_balance?: number
          requested_at?: string
          selected_wallet_id?: string
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_cashout_requests_selected_wallet_id_fkey"
            columns: ["selected_wallet_id"]
            isOneToOne: false
            referencedRelation: "user_wallets"
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
          metadata: Json | null
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
          metadata?: Json | null
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
          metadata?: Json | null
          pipes_passed?: number
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      game_settings: {
        Row: {
          created_at: string
          entry_cost_credits: number
          game_type: string
          id: string
          is_enabled: boolean
          max_shields_purchasable: number | null
          payout_multipliers: Json | null
          shield_cost: number | null
          special_features: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          entry_cost_credits?: number
          game_type: string
          id?: string
          is_enabled?: boolean
          max_shields_purchasable?: number | null
          payout_multipliers?: Json | null
          shield_cost?: number | null
          special_features?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          entry_cost_credits?: number
          game_type?: string
          id?: string
          is_enabled?: boolean
          max_shields_purchasable?: number | null
          payout_multipliers?: Json | null
          shield_cost?: number | null
          special_features?: Json | null
          updated_at?: string
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
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          exit_page: boolean
          id: string
          interactions_count: number
          page_path: string
          page_title: string | null
          scroll_depth_percent: number | null
          session_id: string
          time_on_page_seconds: number | null
          user_id: string | null
          view_time: string
        }
        Insert: {
          created_at?: string
          exit_page?: boolean
          id?: string
          interactions_count?: number
          page_path: string
          page_title?: string | null
          scroll_depth_percent?: number | null
          session_id: string
          time_on_page_seconds?: number | null
          user_id?: string | null
          view_time?: string
        }
        Update: {
          created_at?: string
          exit_page?: boolean
          id?: string
          interactions_count?: number
          page_path?: string
          page_title?: string | null
          scroll_depth_percent?: number | null
          session_id?: string
          time_on_page_seconds?: number | null
          user_id?: string | null
          view_time?: string
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
      referral_transactions: {
        Row: {
          completed_at: string | null
          created_at: string
          credits_awarded: number
          id: string
          referral_code: string
          referred_user_id: string
          referrer_user_id: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          credits_awarded?: number
          id?: string
          referral_code: string
          referred_user_id: string
          referrer_user_id: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          credits_awarded?: number
          id?: string
          referral_code?: string
          referred_user_id?: string
          referrer_user_id?: string
          status?: string
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
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
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
      tool_request_messages: {
        Row: {
          created_at: string
          id: string
          is_admin_message: boolean
          message: string
          sender_id: string
          tool_request_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_admin_message?: boolean
          message: string
          sender_id: string
          tool_request_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_admin_message?: boolean
          message?: string
          sender_id?: string
          tool_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_request_messages_tool_request_id_fkey"
            columns: ["tool_request_id"]
            isOneToOne: false
            referencedRelation: "tool_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_requests: {
        Row: {
          created_at: string
          id: string
          message: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      traffic_sources: {
        Row: {
          campaign_id: string | null
          created_at: string
          id: string
          referrer_domain: string | null
          search_terms: string | null
          session_id: string
          source_name: string | null
          source_type: string
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          id?: string
          referrer_domain?: string | null
          search_terms?: string | null
          session_id: string
          source_name?: string | null
          source_type: string
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          id?: string
          referrer_domain?: string | null
          search_terms?: string | null
          session_id?: string
          source_name?: string | null
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "traffic_sources_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "visitor_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bans: {
        Row: {
          banned_at: string
          banned_by: string
          created_at: string
          id: string
          is_active: boolean
          reason: string | null
          unbanned_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          banned_at?: string
          banned_by: string
          created_at?: string
          id?: string
          is_active?: boolean
          reason?: string | null
          unbanned_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          banned_at?: string
          banned_by?: string
          created_at?: string
          id?: string
          is_active?: boolean
          reason?: string | null
          unbanned_at?: string | null
          updated_at?: string
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
      user_referrals: {
        Row: {
          created_at: string
          id: string
          referral_code: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string
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
      visitor_analytics: {
        Row: {
          browser_name: string | null
          browser_version: string | null
          city: string | null
          country_code: string | null
          country_name: string | null
          created_at: string
          device_type: string | null
          id: string
          is_bot: boolean
          is_mobile: boolean
          isp: string | null
          latitude: number | null
          longitude: number | null
          os_name: string | null
          os_version: string | null
          region: string | null
          screen_resolution: string | null
          session_id: string
          timezone: string | null
          viewport_size: string | null
        }
        Insert: {
          browser_name?: string | null
          browser_version?: string | null
          city?: string | null
          country_code?: string | null
          country_name?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          is_bot?: boolean
          is_mobile?: boolean
          isp?: string | null
          latitude?: number | null
          longitude?: number | null
          os_name?: string | null
          os_version?: string | null
          region?: string | null
          screen_resolution?: string | null
          session_id: string
          timezone?: string | null
          viewport_size?: string | null
        }
        Update: {
          browser_name?: string | null
          browser_version?: string | null
          city?: string | null
          country_code?: string | null
          country_name?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          is_bot?: boolean
          is_mobile?: boolean
          isp?: string | null
          latitude?: number | null
          longitude?: number | null
          os_name?: string | null
          os_version?: string | null
          region?: string | null
          screen_resolution?: string | null
          session_id?: string
          timezone?: string | null
          viewport_size?: string | null
        }
        Relationships: []
      }
      visitor_sessions: {
        Row: {
          created_at: string
          duration_seconds: number | null
          end_time: string | null
          id: string
          ip_address: unknown
          is_bounce: boolean
          page_count: number
          referrer: string | null
          session_id: string
          start_time: string
          updated_at: string
          user_agent: string
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          ip_address: unknown
          is_bounce?: boolean
          page_count?: number
          referrer?: string | null
          session_id: string
          start_time?: string
          updated_at?: string
          user_agent: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          ip_address?: unknown
          is_bounce?: boolean
          page_count?: number
          referrer?: string | null
          session_id?: string
          start_time?: string
          updated_at?: string
          user_agent?: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
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
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_leaderboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: string
          username: string
          full_name: string
          highest_score: number
          total_games: number
          longest_survival: number
          average_score: number
          total_credits_earned: number
          last_played: string
          total_pipes_passed: number
          highest_level: number
          total_lines_cleared: number
        }[]
      }
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
      process_referral_signup: {
        Args: { new_user_id: string; referral_code_param: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      blockchain_type: "cardano" | "sui" | "ethereum" | "solana"
      social_platform:
        | "twitter"
        | "discord"
        | "telegram"
        | "instagram"
        | "youtube"
        | "facebook"
      stake_status: "active" | "pending" | "completed" | "cancelled"
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
      app_role: ["admin", "user"],
      blockchain_type: ["cardano", "sui", "ethereum", "solana"],
      social_platform: [
        "twitter",
        "discord",
        "telegram",
        "instagram",
        "youtube",
        "facebook",
      ],
      stake_status: ["active", "pending", "completed", "cancelled"],
    },
  },
} as const
