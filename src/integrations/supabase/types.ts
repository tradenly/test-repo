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
      admin_access_logs: {
        Row: {
          action: string
          admin_id: string | null
          id: string
          ip_address: string | null
          resource: string | null
          timestamp: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          id?: string
          ip_address?: string | null
          resource?: string | null
          timestamp?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          id?: string
          ip_address?: string | null
          resource?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      admin_actions: {
        Row: {
          action_type: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          market_id: string | null
        }
        Insert: {
          action_type: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          market_id?: string | null
        }
        Update: {
          action_type?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          market_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_actions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_actions_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_audit_logs: {
        Row: {
          action_type: string
          admin_id: string
          changes: Json | null
          created_at: string | null
          id: string
          target_id: string | null
          target_table: string
        }
        Insert: {
          action_type: string
          admin_id: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          target_id?: string | null
          target_table: string
        }
        Update: {
          action_type?: string
          admin_id?: string
          changes?: Json | null
          created_at?: string | null
          id?: string
          target_id?: string | null
          target_table?: string
        }
        Relationships: []
      }
      admin_market_actions: {
        Row: {
          action_details: Json | null
          action_type: string
          admin_id: string | null
          created_at: string | null
          id: string
          market_id: string | null
        }
        Insert: {
          action_details?: Json | null
          action_type: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          market_id?: string | null
        }
        Update: {
          action_details?: Json | null
          action_type?: string
          admin_id?: string | null
          created_at?: string | null
          id?: string
          market_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_market_actions_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission: Database["public"]["Enums"]["admin_permission"]
          role_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission: Database["public"]["Enums"]["admin_permission"]
          role_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          permission?: Database["public"]["Enums"]["admin_permission"]
          role_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_alert_history: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_id: string | null
          id: string
          job_name: string
          message: string | null
          metric_value: number | null
          triggered_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_id?: string | null
          id?: string
          job_name: string
          message?: string | null
          metric_value?: number | null
          triggered_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_id?: string | null
          id?: string
          job_name?: string
          message?: string | null
          metric_value?: number | null
          triggered_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_alert_history_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "analytics_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          enabled: boolean | null
          id: string
          job_name: string
          threshold: number | null
          updated_at: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          job_name: string
          threshold?: number | null
          updated_at?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          job_name?: string
          threshold?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_jobs: {
        Row: {
          created_at: string | null
          id: string
          job_name: string
          last_run_at: string | null
          next_run_at: string | null
          schedule: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_name: string
          last_run_at?: string | null
          next_run_at?: string | null
          schedule?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          job_name?: string
          last_run_at?: string | null
          next_run_at?: string | null
          schedule?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_monitoring: {
        Row: {
          data_processed_mb: number | null
          end_time: string | null
          error_message: string | null
          id: string
          job_name: string
          lock_wait_time_ms: number | null
          memory_usage_mb: number | null
          performance_metrics: Json | null
          query_plan: Json | null
          rows_processed: number | null
          start_time: string
          status: string | null
        }
        Insert: {
          data_processed_mb?: number | null
          end_time?: string | null
          error_message?: string | null
          id?: string
          job_name: string
          lock_wait_time_ms?: number | null
          memory_usage_mb?: number | null
          performance_metrics?: Json | null
          query_plan?: Json | null
          rows_processed?: number | null
          start_time: string
          status?: string | null
        }
        Update: {
          data_processed_mb?: number | null
          end_time?: string | null
          error_message?: string | null
          id?: string
          job_name?: string
          lock_wait_time_ms?: number | null
          memory_usage_mb?: number | null
          performance_metrics?: Json | null
          query_plan?: Json | null
          rows_processed?: number | null
          start_time?: string
          status?: string | null
        }
        Relationships: []
      }
      analytics_optimizations: {
        Row: {
          created_at: string | null
          id: string
          impact_level: string | null
          implemented: boolean | null
          job_name: string
          suggestion: string
          suggestion_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          impact_level?: string | null
          implemented?: boolean | null
          job_name: string
          suggestion: string
          suggestion_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          impact_level?: string | null
          implemented?: boolean | null
          job_name?: string
          suggestion?: string
          suggestion_type?: string
        }
        Relationships: []
      }
      analytics_rate_limits: {
        Row: {
          action_type: string
          first_request_at: string | null
          id: string
          last_request_at: string | null
          max_requests: number | null
          request_count: number | null
          user_id: string
          window_hours: number | null
        }
        Insert: {
          action_type: string
          first_request_at?: string | null
          id?: string
          last_request_at?: string | null
          max_requests?: number | null
          request_count?: number | null
          user_id: string
          window_hours?: number | null
        }
        Update: {
          action_type?: string
          first_request_at?: string | null
          id?: string
          last_request_at?: string | null
          max_requests?: number | null
          request_count?: number | null
          user_id?: string
          window_hours?: number | null
        }
        Relationships: []
      }
      bet_caps: {
        Row: {
          created_at: string
          id: string
          market_id: string | null
          max_no_bet: number
          max_yes_bet: number
          rebalance_threshold: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          market_id?: string | null
          max_no_bet?: number
          max_yes_bet?: number
          rebalance_threshold?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          market_id?: string | null
          max_no_bet?: number
          max_yes_bet?: number
          rebalance_threshold?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bet_caps_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      bet_history: {
        Row: {
          amount: number
          bet_type: string
          created_at: string | null
          game_result: Json
          game_type: string
          id: string
          payout: number
          user_id: string
        }
        Insert: {
          amount: number
          bet_type: string
          created_at?: string | null
          game_result: Json
          game_type: string
          id?: string
          payout: number
          user_id: string
        }
        Update: {
          amount?: number
          bet_type?: string
          created_at?: string | null
          game_result?: Json
          game_type?: string
          id?: string
          payout?: number
          user_id?: string
        }
        Relationships: []
      }
      bets: {
        Row: {
          amount: number
          bet_type: string | null
          created_at: string
          game_id: string
          id: string
          outcome: Json | null
          payout: number | null
          selected_numbers: number[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          bet_type?: string | null
          created_at?: string
          game_id: string
          id?: string
          outcome?: Json | null
          payout?: number | null
          selected_numbers?: number[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          bet_type?: string | null
          created_at?: string
          game_id?: string
          id?: string
          outcome?: Json | null
          payout?: number | null
          selected_numbers?: number[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bets_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      betting_limits: {
        Row: {
          created_at: string | null
          market_id: string
          max_bet_amount: number
          min_bet_amount: number
          pool_balance_limit: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          market_id: string
          max_bet_amount: number
          min_bet_amount?: number
          pool_balance_limit?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          market_id?: string
          max_bet_amount?: number
          min_bet_amount?: number
          pool_balance_limit?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "betting_limits_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: true
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      casino_decks: {
        Row: {
          cards: Json
          created_at: string
          game_id: string | null
          id: string
          updated_at: string
        }
        Insert: {
          cards: Json
          created_at?: string
          game_id?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          cards?: Json
          created_at?: string
          game_id?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "casino_decks_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      casino_game_states: {
        Row: {
          active_bets: Json | null
          coin_flip_state: Json | null
          created_at: string
          current_state: Json
          dealer_hidden_card: Json | null
          dice_values: number[] | null
          game_id: string | null
          game_result: Json | null
          game_type: Database["public"]["Enums"]["game_type"] | null
          id: string
          point_number: number | null
          previous_numbers: number[] | null
          result: Json | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          active_bets?: Json | null
          coin_flip_state?: Json | null
          created_at?: string
          current_state: Json
          dealer_hidden_card?: Json | null
          dice_values?: number[] | null
          game_id?: string | null
          game_result?: Json | null
          game_type?: Database["public"]["Enums"]["game_type"] | null
          id?: string
          point_number?: number | null
          previous_numbers?: number[] | null
          result?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          active_bets?: Json | null
          coin_flip_state?: Json | null
          created_at?: string
          current_state?: Json
          dealer_hidden_card?: Json | null
          dice_values?: number[] | null
          game_id?: string | null
          game_result?: Json | null
          game_type?: Database["public"]["Enums"]["game_type"] | null
          id?: string
          point_number?: number | null
          previous_numbers?: number[] | null
          result?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "casino_game_states_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "casino_game_states_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      category_performance_metrics: {
        Row: {
          active_markets: number | null
          category_id: string | null
          created_at: string | null
          date: string
          id: string
          success_rate: number | null
          total_volume: number | null
        }
        Insert: {
          active_markets?: number | null
          category_id?: string | null
          created_at?: string | null
          date: string
          id?: string
          success_rate?: number | null
          total_volume?: number | null
        }
        Update: {
          active_markets?: number | null
          category_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          success_rate?: number | null
          total_volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "category_performance_metrics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "market_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_deposits: {
        Row: {
          amount: number
          created_at: string | null
          credits_amount: number
          crypto_type: string
          id: string
          status:
            | Database["public"]["Enums"]["crypto_verification_status"]
            | null
          transaction_hash: string | null
          updated_at: string | null
          user_id: string
          verification_deadline: string | null
          verified_by: string | null
          wallet_address: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          credits_amount: number
          crypto_type: string
          id?: string
          status?:
            | Database["public"]["Enums"]["crypto_verification_status"]
            | null
          transaction_hash?: string | null
          updated_at?: string | null
          user_id: string
          verification_deadline?: string | null
          verified_by?: string | null
          wallet_address: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          credits_amount?: number
          crypto_type?: string
          id?: string
          status?:
            | Database["public"]["Enums"]["crypto_verification_status"]
            | null
          transaction_hash?: string | null
          updated_at?: string | null
          user_id?: string
          verification_deadline?: string | null
          verified_by?: string | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "crypto_deposits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crypto_deposits_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_withdrawals: {
        Row: {
          amount: number
          created_at: string | null
          credits_amount: number
          crypto_type: string
          id: string
          processed_by: string | null
          status:
            | Database["public"]["Enums"]["crypto_verification_status"]
            | null
          transaction_hash: string | null
          updated_at: string | null
          user_id: string
          wallet_address: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          credits_amount: number
          crypto_type: string
          id?: string
          processed_by?: string | null
          status?:
            | Database["public"]["Enums"]["crypto_verification_status"]
            | null
          transaction_hash?: string | null
          updated_at?: string | null
          user_id: string
          wallet_address: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          credits_amount?: number
          crypto_type?: string
          id?: string
          processed_by?: string | null
          status?:
            | Database["public"]["Enums"]["crypto_verification_status"]
            | null
          transaction_hash?: string | null
          updated_at?: string | null
          user_id?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "crypto_withdrawals_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crypto_withdrawals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      database_monitoring: {
        Row: {
          id: string
          metrics: Json
          timestamp: string | null
        }
        Insert: {
          id?: string
          metrics: Json
          timestamp?: string | null
        }
        Update: {
          id?: string
          metrics?: Json
          timestamp?: string | null
        }
        Relationships: []
      }
      deck_shuffles: {
        Row: {
          created_at: string
          deck_state: Json
          game_id: string | null
          id: string
          shuffle_seed: string
          validated: boolean | null
        }
        Insert: {
          created_at?: string
          deck_state: Json
          game_id?: string | null
          id?: string
          shuffle_seed: string
          validated?: boolean | null
        }
        Update: {
          created_at?: string
          deck_state?: Json
          game_id?: string | null
          id?: string
          shuffle_seed?: string
          validated?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "deck_shuffles_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          admin_resolution_notes: string | null
          admin_response: string | null
          created_at: string
          evidence: Json | null
          id: string
          market_id: string
          reason: string
          resolution_notes: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_resolution_notes?: string | null
          admin_response?: string | null
          created_at?: string
          evidence?: Json | null
          id?: string
          market_id: string
          reason: string
          resolution_notes?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_resolution_notes?: string | null
          admin_response?: string | null
          created_at?: string
          evidence?: Json | null
          id?: string
          market_id?: string
          reason?: string
          resolution_notes?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_configurations: {
        Row: {
          created_at: string | null
          creator_fee_percentage: number
          flat_fee_amount: number
          id: string
          market_id: string | null
          platform_fee_percentage: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          creator_fee_percentage?: number
          flat_fee_amount?: number
          id?: string
          market_id?: string | null
          platform_fee_percentage?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          creator_fee_percentage?: number
          flat_fee_amount?: number
          id?: string
          market_id?: string | null
          platform_fee_percentage?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_configurations_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_distribution: {
        Row: {
          bet_id: string | null
          created_at: string | null
          creator_fee: number
          flat_fee_amount: number
          id: string
          market_id: string | null
          platform_fee: number
        }
        Insert: {
          bet_id?: string | null
          created_at?: string | null
          creator_fee: number
          flat_fee_amount: number
          id?: string
          market_id?: string | null
          platform_fee: number
        }
        Update: {
          bet_id?: string | null
          created_at?: string | null
          creator_fee?: number
          flat_fee_amount?: number
          id?: string
          market_id?: string | null
          platform_fee?: number
        }
        Relationships: [
          {
            foreignKeyName: "fee_distribution_bet_id_fkey"
            columns: ["bet_id"]
            isOneToOne: false
            referencedRelation: "prediction_market_bets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_distribution_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_distributions: {
        Row: {
          creator_fee: number
          distributed_at: string
          id: string
          market_id: string | null
          platform_fee: number
          total_amount: number
        }
        Insert: {
          creator_fee?: number
          distributed_at?: string
          id?: string
          market_id?: string | null
          platform_fee?: number
          total_amount?: number
        }
        Update: {
          creator_fee?: number
          distributed_at?: string
          id?: string
          market_id?: string | null
          platform_fee?: number
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "fee_distributions_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_tracking: {
        Row: {
          bet_id: string | null
          collection_status: string
          created_at: string | null
          creator_fee_amount: number
          distribution_attempts: number | null
          distribution_error: string | null
          distribution_status: string
          flat_fee_amount: number
          id: string
          last_attempt_at: string | null
          market_id: string | null
          platform_fee_amount: number
          processed_at: string | null
          total_fee_amount: number
        }
        Insert: {
          bet_id?: string | null
          collection_status?: string
          created_at?: string | null
          creator_fee_amount?: number
          distribution_attempts?: number | null
          distribution_error?: string | null
          distribution_status?: string
          flat_fee_amount?: number
          id?: string
          last_attempt_at?: string | null
          market_id?: string | null
          platform_fee_amount?: number
          processed_at?: string | null
          total_fee_amount?: number
        }
        Update: {
          bet_id?: string | null
          collection_status?: string
          created_at?: string | null
          creator_fee_amount?: number
          distribution_attempts?: number | null
          distribution_error?: string | null
          distribution_status?: string
          flat_fee_amount?: number
          id?: string
          last_attempt_at?: string | null
          market_id?: string | null
          platform_fee_amount?: number
          processed_at?: string | null
          total_fee_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "fee_tracking_bet_id_fkey"
            columns: ["bet_id"]
            isOneToOne: false
            referencedRelation: "prediction_market_bets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_tracking_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      game_activity_logs: {
        Row: {
          activity_type: string
          created_at: string | null
          details: Json | null
          game_id: string | null
          id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          details?: Json | null
          game_id?: string | null
          id?: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          details?: Json | null
          game_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_activity_logs_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_analytics: {
        Row: {
          created_at: string | null
          game_id: string | null
          id: string
          total_bets: number | null
          total_fees_collected: number | null
          total_volume: number | null
          unique_players: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          game_id?: string | null
          id?: string
          total_bets?: number | null
          total_fees_collected?: number | null
          total_volume?: number | null
          unique_players?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          game_id?: string | null
          id?: string
          total_bets?: number | null
          total_fees_collected?: number | null
          total_volume?: number | null
          unique_players?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_analytics_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: true
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_revenue: {
        Row: {
          created_at: string | null
          daily_revenue: number | null
          date: string | null
          game_id: string | null
          id: string
          total_bets: number | null
          total_fees_collected: number | null
          unique_players: number | null
        }
        Insert: {
          created_at?: string | null
          daily_revenue?: number | null
          date?: string | null
          game_id?: string | null
          id?: string
          total_bets?: number | null
          total_fees_collected?: number | null
          unique_players?: number | null
        }
        Update: {
          created_at?: string | null
          daily_revenue?: number | null
          date?: string | null
          game_id?: string | null
          id?: string
          total_bets?: number | null
          total_fees_collected?: number | null
          unique_players?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_revenue_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          ended_at: string | null
          game_id: string | null
          id: string
          net_profit: number | null
          started_at: string | null
          total_bets: number | null
          total_wagered: number | null
          user_id: string | null
        }
        Insert: {
          ended_at?: string | null
          game_id?: string | null
          id?: string
          net_profit?: number | null
          started_at?: string | null
          total_bets?: number | null
          total_wagered?: number | null
          user_id?: string | null
        }
        Update: {
          ended_at?: string | null
          game_id?: string | null
          id?: string
          net_profit?: number | null
          started_at?: string | null
          total_bets?: number | null
          total_wagered?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      game_settings: {
        Row: {
          created_at: string | null
          game_id: string | null
          house_edge: number | null
          id: string
          is_active: boolean
          is_enabled: boolean | null
          maintenance_mode: boolean | null
          max_bet: number | null
          min_bet: number | null
          settings: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          game_id?: string | null
          house_edge?: number | null
          id?: string
          is_active?: boolean
          is_enabled?: boolean | null
          maintenance_mode?: boolean | null
          max_bet?: number | null
          min_bet?: number | null
          settings?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          game_id?: string | null
          house_edge?: number | null
          id?: string
          is_active?: boolean
          is_enabled?: boolean | null
          maintenance_mode?: boolean | null
          max_bet?: number | null
          min_bet?: number | null
          settings?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_settings_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          admin_status: Database["public"]["Enums"]["game_status"] | null
          config: Json | null
          created_at: string
          id: string
          max_bet: number | null
          max_table_bet: number | null
          min_bet: number | null
          previous_numbers_limit: number | null
          status: string
          type: Database["public"]["Enums"]["game_type"]
          updated_at: string
          wheel_type: string | null
        }
        Insert: {
          admin_status?: Database["public"]["Enums"]["game_status"] | null
          config?: Json | null
          created_at?: string
          id?: string
          max_bet?: number | null
          max_table_bet?: number | null
          min_bet?: number | null
          previous_numbers_limit?: number | null
          status?: string
          type: Database["public"]["Enums"]["game_type"]
          updated_at?: string
          wheel_type?: string | null
        }
        Update: {
          admin_status?: Database["public"]["Enums"]["game_status"] | null
          config?: Json | null
          created_at?: string
          id?: string
          max_bet?: number | null
          max_table_bet?: number | null
          min_bet?: number | null
          previous_numbers_limit?: number | null
          status?: string
          type?: Database["public"]["Enums"]["game_type"]
          updated_at?: string
          wheel_type?: string | null
        }
        Relationships: []
      }
      market_analytics: {
        Row: {
          active_participants: number | null
          created_at: string
          id: string
          last_bet_at: string | null
          market_id: string
          total_participants: number | null
          total_volume: number | null
          updated_at: string
          view_count: number | null
        }
        Insert: {
          active_participants?: number | null
          created_at?: string
          id?: string
          last_bet_at?: string | null
          market_id: string
          total_participants?: number | null
          total_volume?: number | null
          updated_at?: string
          view_count?: number | null
        }
        Update: {
          active_participants?: number | null
          created_at?: string
          id?: string
          last_bet_at?: string | null
          market_id?: string
          total_participants?: number | null
          total_volume?: number | null
          updated_at?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "market_analytics_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: true
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      market_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      market_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          market_id: string
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          market_id: string
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          market_id?: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_comments_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "market_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      market_configuration: {
        Row: {
          bet_fee_amount: number
          created_at: string
          creator_fee_percentage: number
          id: string
          is_active: boolean
          market_creation_cost: number
          max_bet_amount: number
          min_bet_amount: number
          total_pool_fee_percentage: number | null
          updated_at: string
          updated_by: string | null
          voter_fee_percentage: number
          voting_period_hours: number
        }
        Insert: {
          bet_fee_amount?: number
          created_at?: string
          creator_fee_percentage?: number
          id?: string
          is_active?: boolean
          market_creation_cost?: number
          max_bet_amount?: number
          min_bet_amount?: number
          total_pool_fee_percentage?: number | null
          updated_at?: string
          updated_by?: string | null
          voter_fee_percentage?: number
          voting_period_hours?: number
        }
        Update: {
          bet_fee_amount?: number
          created_at?: string
          creator_fee_percentage?: number
          id?: string
          is_active?: boolean
          market_creation_cost?: number
          max_bet_amount?: number
          min_bet_amount?: number
          total_pool_fee_percentage?: number | null
          updated_at?: string
          updated_by?: string | null
          voter_fee_percentage?: number
          voting_period_hours?: number
        }
        Relationships: []
      }
      market_followers: {
        Row: {
          created_at: string
          id: string
          market_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          market_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          market_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_followers_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_followers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      market_odds: {
        Row: {
          id: string
          market_id: string | null
          max_bet: number
          max_pool_imbalance: number
          min_bet: number
          no_odds: number
          total_no_pool: number
          total_yes_pool: number
          updated_at: string | null
          yes_odds: number
        }
        Insert: {
          id?: string
          market_id?: string | null
          max_bet?: number
          max_pool_imbalance?: number
          min_bet?: number
          no_odds?: number
          total_no_pool?: number
          total_yes_pool?: number
          updated_at?: string | null
          yes_odds?: number
        }
        Update: {
          id?: string
          market_id?: string | null
          max_bet?: number
          max_pool_imbalance?: number
          min_bet?: number
          no_odds?: number
          total_no_pool?: number
          total_yes_pool?: number
          updated_at?: string | null
          yes_odds?: number
        }
        Relationships: [
          {
            foreignKeyName: "market_odds_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      market_performance_metrics: {
        Row: {
          bet_count: number | null
          created_at: string | null
          daily_volume: number | null
          date: string
          id: string
          market_id: string | null
          participant_count: number | null
        }
        Insert: {
          bet_count?: number | null
          created_at?: string | null
          daily_volume?: number | null
          date: string
          id?: string
          market_id?: string | null
          participant_count?: number | null
        }
        Update: {
          bet_count?: number | null
          created_at?: string | null
          daily_volume?: number | null
          date?: string
          id?: string
          market_id?: string | null
          participant_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "market_performance_metrics_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      market_price_history: {
        Row: {
          id: string
          market_id: string
          no_price: number
          timestamp: string
          volume: number
          yes_price: number
        }
        Insert: {
          id?: string
          market_id: string
          no_price: number
          timestamp?: string
          volume?: number
          yes_price: number
        }
        Update: {
          id?: string
          market_id?: string
          no_price?: number
          timestamp?: string
          volume?: number
          yes_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_market"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      market_resolutions: {
        Row: {
          admin_id: string | null
          consensus_required: boolean | null
          created_at: string | null
          current_step: number | null
          evidence: Json | null
          id: string
          justification: string | null
          market_id: string | null
          outcome: boolean | null
          resolution_status: string | null
          secondary_verification_id: string | null
          updated_at: string | null
          verification_date: string | null
          verification_deadline: string | null
          verification_steps: number | null
        }
        Insert: {
          admin_id?: string | null
          consensus_required?: boolean | null
          created_at?: string | null
          current_step?: number | null
          evidence?: Json | null
          id?: string
          justification?: string | null
          market_id?: string | null
          outcome?: boolean | null
          resolution_status?: string | null
          secondary_verification_id?: string | null
          updated_at?: string | null
          verification_date?: string | null
          verification_deadline?: string | null
          verification_steps?: number | null
        }
        Update: {
          admin_id?: string | null
          consensus_required?: boolean | null
          created_at?: string | null
          current_step?: number | null
          evidence?: Json | null
          id?: string
          justification?: string | null
          market_id?: string | null
          outcome?: boolean | null
          resolution_status?: string | null
          secondary_verification_id?: string | null
          updated_at?: string | null
          verification_date?: string | null
          verification_deadline?: string | null
          verification_steps?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "market_resolutions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_resolutions_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_resolutions_secondary_verification_id_fkey"
            columns: ["secondary_verification_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      market_risk_metrics: {
        Row: {
          created_at: string | null
          id: string
          last_updated: string | null
          market_id: string | null
          pool_imbalance: number | null
          price_volatility: number | null
          total_exposure: number | null
          unusual_activity: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_updated?: string | null
          market_id?: string | null
          pool_imbalance?: number | null
          price_volatility?: number | null
          total_exposure?: number | null
          unusual_activity?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_updated?: string | null
          market_id?: string | null
          pool_imbalance?: number | null
          price_volatility?: number | null
          total_exposure?: number | null
          unusual_activity?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "market_risk_metrics_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      market_state_changes: {
        Row: {
          automated: boolean | null
          changed_at: string | null
          changed_by: string | null
          id: string
          market_id: string | null
          new_state: string | null
          previous_state: string | null
          reason: string | null
        }
        Insert: {
          automated?: boolean | null
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          market_id?: string | null
          new_state?: string | null
          previous_state?: string | null
          reason?: string | null
        }
        Update: {
          automated?: boolean | null
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          market_id?: string | null
          new_state?: string | null
          previous_state?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_state_changes_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_state_changes_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      market_verification_steps: {
        Row: {
          created_at: string | null
          description: string
          evidence: Json | null
          id: string
          market_id: string | null
          status: string | null
          step_number: number
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          evidence?: Json | null
          id?: string
          market_id?: string | null
          status?: string | null
          step_number: number
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          evidence?: Json | null
          id?: string
          market_id?: string | null
          status?: string | null
          step_number?: number
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_verification_steps_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      market_vote_decisions: {
        Row: {
          admin_id: string
          created_at: string | null
          decision: boolean | null
          id: string
          market_id: string
          original_vote_result: boolean | null
          override_reason: string | null
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          decision?: boolean | null
          id?: string
          market_id: string
          original_vote_result?: boolean | null
          override_reason?: string | null
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          decision?: boolean | null
          id?: string
          market_id?: string
          original_vote_result?: boolean | null
          override_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "market_vote_decisions_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      market_votes: {
        Row: {
          created_at: string | null
          id: string
          market_id: string
          user_id: string
          vote: boolean
        }
        Insert: {
          created_at?: string | null
          id?: string
          market_id: string
          user_id: string
          vote: boolean
        }
        Update: {
          created_at?: string | null
          id?: string
          market_id?: string
          user_id?: string
          vote?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "market_votes_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          market_id: string | null
          message: string
          metadata: Json | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          market_id?: string | null
          message: string
          metadata?: Json | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          created_at?: string
          id?: string
          market_id?: string | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      odds_history: {
        Row: {
          id: string
          market_id: string | null
          no_odds: number
          timestamp: string
          yes_odds: number
        }
        Insert: {
          id?: string
          market_id?: string | null
          no_odds: number
          timestamp?: string
          yes_odds: number
        }
        Update: {
          id?: string
          market_id?: string | null
          no_odds?: number
          timestamp?: string
          yes_odds?: number
        }
        Relationships: [
          {
            foreignKeyName: "odds_history_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_requests: {
        Row: {
          admin_id: string | null
          admin_notes: string | null
          amount: number
          completed_at: string | null
          created_at: string | null
          crypto_currency: Database["public"]["Enums"]["crypto_currency"]
          id: string
          status: string
          transaction_hash: string | null
          updated_at: string | null
          user_id: string
          wallet_address: string
        }
        Insert: {
          admin_id?: string | null
          admin_notes?: string | null
          amount: number
          completed_at?: string | null
          created_at?: string | null
          crypto_currency: Database["public"]["Enums"]["crypto_currency"]
          id?: string
          status: string
          transaction_hash?: string | null
          updated_at?: string | null
          user_id: string
          wallet_address: string
        }
        Update: {
          admin_id?: string | null
          admin_notes?: string | null
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          crypto_currency?: Database["public"]["Enums"]["crypto_currency"]
          id?: string
          status?: string
          transaction_hash?: string | null
          updated_at?: string | null
          user_id?: string
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_requests_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_tracking: {
        Row: {
          amount: number
          created_at: string | null
          game_id: string | null
          id: string
          payout_type: string
          processed_at: string | null
          processed_by: string | null
          status: string
          transaction_reference: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          game_id?: string | null
          id?: string
          payout_type: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          transaction_reference?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          game_id?: string | null
          id?: string
          payout_type?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          transaction_reference?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payout_tracking_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_tracking_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_metrics: {
        Row: {
          id: string
          imbalance_ratio: number | null
          last_checked_at: string | null
          market_id: string | null
          no_pool_size: number | null
          yes_pool_size: number | null
        }
        Insert: {
          id?: string
          imbalance_ratio?: number | null
          last_checked_at?: string | null
          market_id?: string | null
          no_pool_size?: number | null
          yes_pool_size?: number | null
        }
        Update: {
          id?: string
          imbalance_ratio?: number | null
          last_checked_at?: string | null
          market_id?: string | null
          no_pool_size?: number | null
          yes_pool_size?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pool_metrics_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: true
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      position_history: {
        Row: {
          amount: number
          auto_close_threshold: number | null
          closed_at: string | null
          created_at: string
          entry_price: number
          exit_price: number | null
          id: string
          last_risk_check: string | null
          market_id: string
          position: boolean
          profit_loss: number | null
          risk_score: number | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          auto_close_threshold?: number | null
          closed_at?: string | null
          created_at?: string
          entry_price: number
          exit_price?: number | null
          id?: string
          last_risk_check?: string | null
          market_id: string
          position: boolean
          profit_loss?: number | null
          risk_score?: number | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          auto_close_threshold?: number | null
          closed_at?: string | null
          created_at?: string
          entry_price?: number
          exit_price?: number | null
          id?: string
          last_risk_check?: string | null
          market_id?: string
          position?: boolean
          profit_loss?: number | null
          risk_score?: number | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_market"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_market_bets: {
        Row: {
          amount: number
          created_at: string
          creator_fee_paid: number
          fee_status: string
          id: string
          market_id: string
          payout_pool_share: number | null
          platform_fee_paid: number
          pool_contribution_date: string | null
          position: boolean
          potential_payout: number
          status: string
          total_fees: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          creator_fee_paid?: number
          fee_status?: string
          id?: string
          market_id: string
          payout_pool_share?: number | null
          platform_fee_paid?: number
          pool_contribution_date?: string | null
          position: boolean
          potential_payout: number
          status?: string
          total_fees?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          creator_fee_paid?: number
          fee_status?: string
          id?: string
          market_id?: string
          payout_pool_share?: number | null
          platform_fee_paid?: number
          pool_contribution_date?: string | null
          position?: boolean
          potential_payout?: number
          status?: string
          total_fees?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_prediction_market_bets_market"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prediction_market_bets_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prediction_market_bets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_market_votes: {
        Row: {
          created_at: string | null
          id: string
          market_id: string | null
          reward_amount: number | null
          reward_claimed: boolean | null
          reward_eligible: boolean | null
          user_id: string | null
          vote: boolean
        }
        Insert: {
          created_at?: string | null
          id?: string
          market_id?: string | null
          reward_amount?: number | null
          reward_claimed?: boolean | null
          reward_eligible?: boolean | null
          user_id?: string | null
          vote: boolean
        }
        Update: {
          created_at?: string | null
          id?: string
          market_id?: string | null
          reward_amount?: number | null
          reward_claimed?: boolean | null
          reward_eligible?: boolean | null
          user_id?: string | null
          vote?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "prediction_market_votes_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prediction_market_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prediction_markets: {
        Row: {
          admin_resolution_date: string | null
          admin_resolution_status: string | null
          betting_cap: number
          category_id: string | null
          community_voting_enabled: boolean | null
          created_at: string
          creation_fee_paid: number | null
          creator_earnings: number | null
          creator_fee_percentage: number
          creator_id: string | null
          current_pool_balance: number | null
          cursor_id: number
          cutoff_time: string | null
          description: string
          end_date: string
          flat_fee_amount: number
          id: string
          initial_grace_period_end: string | null
          is_resolved: boolean | null
          last_modified_by: string | null
          last_status_update: string | null
          max_bet: number | null
          max_pool_imbalance: number | null
          min_bet: number | null
          min_pool_size: number | null
          min_pool_threshold: number
          minimum_participation_credits: number
          minimum_vote_credits: number | null
          no_vote_percentage: number | null
          outcome: boolean | null
          payout_delay: unknown | null
          payout_pool: number
          platform_fee: number
          pool_balance_limit: number
          pool_balance_ratio: number | null
          resolution_date: string | null
          resolution_notes: string | null
          status: string
          title: string
          total_fees_collected: number
          total_no_amount: number | null
          total_votes: number | null
          total_yes_amount: number | null
          updated_at: string
          voter_fee_percentage: number | null
          votes_no: number | null
          votes_yes: number | null
          voting_ends_at: string | null
          voting_started_at: string | null
          yes_vote_percentage: number | null
        }
        Insert: {
          admin_resolution_date?: string | null
          admin_resolution_status?: string | null
          betting_cap?: number
          category_id?: string | null
          community_voting_enabled?: boolean | null
          created_at?: string
          creation_fee_paid?: number | null
          creator_earnings?: number | null
          creator_fee_percentage?: number
          creator_id?: string | null
          current_pool_balance?: number | null
          cursor_id?: number
          cutoff_time?: string | null
          description: string
          end_date: string
          flat_fee_amount?: number
          id?: string
          initial_grace_period_end?: string | null
          is_resolved?: boolean | null
          last_modified_by?: string | null
          last_status_update?: string | null
          max_bet?: number | null
          max_pool_imbalance?: number | null
          min_bet?: number | null
          min_pool_size?: number | null
          min_pool_threshold?: number
          minimum_participation_credits?: number
          minimum_vote_credits?: number | null
          no_vote_percentage?: number | null
          outcome?: boolean | null
          payout_delay?: unknown | null
          payout_pool?: number
          platform_fee?: number
          pool_balance_limit?: number
          pool_balance_ratio?: number | null
          resolution_date?: string | null
          resolution_notes?: string | null
          status?: string
          title: string
          total_fees_collected?: number
          total_no_amount?: number | null
          total_votes?: number | null
          total_yes_amount?: number | null
          updated_at?: string
          voter_fee_percentage?: number | null
          votes_no?: number | null
          votes_yes?: number | null
          voting_ends_at?: string | null
          voting_started_at?: string | null
          yes_vote_percentage?: number | null
        }
        Update: {
          admin_resolution_date?: string | null
          admin_resolution_status?: string | null
          betting_cap?: number
          category_id?: string | null
          community_voting_enabled?: boolean | null
          created_at?: string
          creation_fee_paid?: number | null
          creator_earnings?: number | null
          creator_fee_percentage?: number
          creator_id?: string | null
          current_pool_balance?: number | null
          cursor_id?: number
          cutoff_time?: string | null
          description?: string
          end_date?: string
          flat_fee_amount?: number
          id?: string
          initial_grace_period_end?: string | null
          is_resolved?: boolean | null
          last_modified_by?: string | null
          last_status_update?: string | null
          max_bet?: number | null
          max_pool_imbalance?: number | null
          min_bet?: number | null
          min_pool_size?: number | null
          min_pool_threshold?: number
          minimum_participation_credits?: number
          minimum_vote_credits?: number | null
          no_vote_percentage?: number | null
          outcome?: boolean | null
          payout_delay?: unknown | null
          payout_pool?: number
          platform_fee?: number
          pool_balance_limit?: number
          pool_balance_ratio?: number | null
          resolution_date?: string | null
          resolution_notes?: string | null
          status?: string
          title?: string
          total_fees_collected?: number
          total_no_amount?: number | null
          total_votes?: number | null
          total_yes_amount?: number | null
          updated_at?: string
          voter_fee_percentage?: number | null
          votes_no?: number | null
          votes_yes?: number | null
          voting_ends_at?: string | null
          voting_started_at?: string | null
          yes_vote_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prediction_markets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "market_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prediction_markets_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          balance: number
          created_at: string
          email: string | null
          id: string
          is_admin: boolean | null
          is_suspended: boolean | null
          markets_created: number | null
          prediction_reputation: number | null
          successful_predictions: number | null
          sui_address: string | null
          sui_session_token: string | null
          suspension_reason: string | null
          total_predictions: number | null
          updated_at: string
          username: string
        }
        Insert: {
          balance?: number
          created_at?: string
          email?: string | null
          id: string
          is_admin?: boolean | null
          is_suspended?: boolean | null
          markets_created?: number | null
          prediction_reputation?: number | null
          successful_predictions?: number | null
          sui_address?: string | null
          sui_session_token?: string | null
          suspension_reason?: string | null
          total_predictions?: number | null
          updated_at?: string
          username: string
        }
        Update: {
          balance?: number
          created_at?: string
          email?: string | null
          id?: string
          is_admin?: boolean | null
          is_suspended?: boolean | null
          markets_created?: number | null
          prediction_reputation?: number | null
          successful_predictions?: number | null
          sui_address?: string | null
          sui_session_token?: string | null
          suspension_reason?: string | null
          total_predictions?: number | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      rate_limit_usage: {
        Row: {
          action_type: Database["public"]["Enums"]["rate_limit_action"]
          first_request_at: string
          id: string
          ip_address: string | null
          last_request_at: string
          request_count: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          action_type: Database["public"]["Enums"]["rate_limit_action"]
          first_request_at?: string
          id?: string
          ip_address?: string | null
          last_request_at?: string
          request_count?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: Database["public"]["Enums"]["rate_limit_action"]
          first_request_at?: string
          id?: string
          ip_address?: string | null
          last_request_at?: string
          request_count?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action_type: Database["public"]["Enums"]["rate_limit_action"]
          count: number | null
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          action_type: Database["public"]["Enums"]["rate_limit_action"]
          count?: number | null
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          action_type?: Database["public"]["Enums"]["rate_limit_action"]
          count?: number | null
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      resolution_evidence: {
        Row: {
          content: string | null
          created_at: string | null
          evidence_type: string | null
          id: string
          resolution_id: string | null
          submitted_by: string | null
          verified: boolean | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          evidence_type?: string | null
          id?: string
          resolution_id?: string | null
          submitted_by?: string | null
          verified?: boolean | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          evidence_type?: string | null
          id?: string
          resolution_id?: string | null
          submitted_by?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "resolution_evidence_resolution_id_fkey"
            columns: ["resolution_id"]
            isOneToOne: false
            referencedRelation: "market_resolutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resolution_evidence_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_metrics: {
        Row: {
          created_at: string | null
          id: string
          market_id: string | null
          max_loss: number | null
          pool_imbalance: number | null
          total_exposure: number | null
          unusual_activity: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          market_id?: string | null
          max_loss?: number | null
          pool_imbalance?: number | null
          total_exposure?: number | null
          unusual_activity?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          market_id?: string | null
          max_loss?: number | null
          pool_imbalance?: number | null
          total_exposure?: number | null
          unusual_activity?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_metrics_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: true
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_thresholds: {
        Row: {
          created_at: string | null
          id: string
          market_id: string | null
          max_pool_imbalance: number | null
          max_position_size: number | null
          min_liquidity: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          market_id?: string | null
          max_pool_imbalance?: number | null
          max_position_size?: number | null
          min_liquidity?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          market_id?: string | null
          max_pool_imbalance?: number | null
          max_position_size?: number | null
          min_liquidity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_thresholds_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: true
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
        ]
      }
      roulette_statistics: {
        Row: {
          created_at: string | null
          frequency: number | null
          game_id: string | null
          id: string
          last_hit: string | null
          number: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          frequency?: number | null
          game_id?: string | null
          id?: string
          last_hit?: string | null
          number?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          frequency?: number | null
          game_id?: string | null
          id?: string
          last_hit?: string | null
          number?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roulette_statistics_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      sports_bets: {
        Row: {
          amount: number
          created_at: string
          event_id: string
          id: string
          odds_id: string
          potential_payout: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          event_id: string
          id?: string
          odds_id: string
          potential_payout: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          event_id?: string
          id?: string
          odds_id?: string
          potential_payout?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sports_bets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "sports_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sports_bets_odds_id_fkey"
            columns: ["odds_id"]
            isOneToOne: false
            referencedRelation: "sports_odds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sports_bets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sports_events: {
        Row: {
          away_score: number | null
          away_team: string
          created_at: string
          end_time: string | null
          home_score: number | null
          home_team: string
          id: string
          sport: Database["public"]["Enums"]["sport_type"]
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          away_score?: number | null
          away_team: string
          created_at?: string
          end_time?: string | null
          home_score?: number | null
          home_team: string
          id?: string
          sport: Database["public"]["Enums"]["sport_type"]
          start_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          away_score?: number | null
          away_team?: string
          created_at?: string
          end_time?: string | null
          home_score?: number | null
          home_team?: string
          id?: string
          sport?: Database["public"]["Enums"]["sport_type"]
          start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      sports_odds: {
        Row: {
          created_at: string
          event_id: string
          id: string
          market_type: string
          odds: number
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          market_type: string
          odds: number
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          market_type?: string
          odds?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sports_odds_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "sports_events"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          category: Database["public"]["Enums"]["ticket_category"]
          created_at: string
          id: string
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["ticket_category"]
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["ticket_category"]
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          created_at: string
          id: string
          is_admin: boolean
          message: string
          sender_id: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_admin?: boolean
          message: string
          sender_id: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_admin?: boolean
          message?: string
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          crypto_currency: Database["public"]["Enums"]["crypto_currency"] | null
          id: string
          status: Database["public"]["Enums"]["transaction_status"] | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          crypto_currency?:
            | Database["public"]["Enums"]["crypto_currency"]
            | null
          id?: string
          status?: Database["public"]["Enums"]["transaction_status"] | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          crypto_currency?:
            | Database["public"]["Enums"]["crypto_currency"]
            | null
          id?: string
          status?: Database["public"]["Enums"]["transaction_status"] | null
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_engagement_metrics: {
        Row: {
          avg_bet_size: number | null
          created_at: string | null
          daily_active_users: number | null
          date: string
          id: string
          new_users: number | null
          retention_rate: number | null
        }
        Insert: {
          avg_bet_size?: number | null
          created_at?: string | null
          daily_active_users?: number | null
          date: string
          id?: string
          new_users?: number | null
          retention_rate?: number | null
        }
        Update: {
          avg_bet_size?: number | null
          created_at?: string | null
          daily_active_users?: number | null
          date?: string
          id?: string
          new_users?: number | null
          retention_rate?: number | null
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          notification_id: string | null
          read_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_id?: string | null
          read_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_id?: string | null
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_notification_id_fkey"
            columns: ["notification_id"]
            isOneToOne: false
            referencedRelation: "notifications"
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
      verification_steps: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          id: string
          notes: string | null
          resolution_id: string | null
          status: string | null
          step_number: number | null
          step_type: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          resolution_id?: string | null
          status?: string | null
          step_number?: number | null
          step_type?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          resolution_id?: string | null
          status?: string | null
          step_number?: number | null
          step_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "verification_steps_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "verification_steps_resolution_id_fkey"
            columns: ["resolution_id"]
            isOneToOne: false
            referencedRelation: "market_resolutions"
            referencedColumns: ["id"]
          },
        ]
      }
      voting_rewards: {
        Row: {
          claimed: boolean
          created_at: string | null
          id: string
          market_id: string
          reward_amount: number
          user_id: string
        }
        Insert: {
          claimed?: boolean
          created_at?: string | null
          id?: string
          market_id: string
          reward_amount?: number
          user_id: string
        }
        Update: {
          claimed?: boolean
          created_at?: string | null
          id?: string
          market_id?: string
          reward_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voting_rewards_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "prediction_markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voting_rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_user_balance: {
        Args: { target_user_id: string; new_balance: number }
        Returns: Json
      }
      automated_market_resolution: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      begin_transaction: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cache_admin_status: {
        Args: { _user_id: string }
        Returns: boolean
      }
      calculate_baccarat_value: {
        Args: { hand: Json }
        Returns: number
      }
      calculate_dynamic_odds: {
        Args:
          | { p_yes_pool: number; p_no_pool: number }
          | { p_yes_pool: number; p_no_pool: number; p_total_pool: number }
        Returns: {
          yes_odds: number
          no_odds: number
        }[]
      }
      calculate_market_risk: {
        Args: { p_market_id: string }
        Returns: Json
      }
      calculate_market_risk_metrics: {
        Args: { p_market_id: string }
        Returns: undefined
      }
      cancel_prediction_market: {
        Args: {
          p_market_id: string
          p_admin_id: string
          p_admin_notes: string
          p_refund_type: string
          p_notification_message: string
        }
        Returns: Json
      }
      check_admin_status: {
        Args: { _user_id: string }
        Returns: boolean
      }
      check_analytics_alerts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_and_fix_game_sessions_duplicates: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_balance: {
        Args: { required_amount: number }
        Returns: boolean
      }
      check_locks: {
        Args: Record<PropertyKey, never>
        Returns: {
          locked_table: string
          lock_type: string
          granted: boolean
        }[]
      }
      check_rate_limit: {
        Args:
          | {
              p_user_id: string
              p_action_type: Database["public"]["Enums"]["game_action_type"]
              p_max_requests?: number
              p_window_hours?: number
            }
          | {
              p_user_id: string
              p_ip_address: string
              p_action_type: Database["public"]["Enums"]["game_action_type"]
              p_max_requests: number
              p_window_hours: number
            }
        Returns: boolean
      }
      check_voting_eligibility: {
        Args: { p_market_id: string; p_user_id: string }
        Returns: boolean
      }
      claim_voter_reward: {
        Args: { p_market_id: string; p_user_id: string }
        Returns: {
          reward_amount: number
        }[]
      }
      claim_voting_reward: {
        Args: { p_user_id: string; p_market_id: string }
        Returns: Json
      }
      cleanup_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      complete_market_verification: {
        Args: { market_id: string }
        Returns: boolean
      }
      control_analytics_job: {
        Args: { p_job_name: string; p_action: string }
        Returns: Json
      }
      create_admin_notification: {
        Args: {
          p_type: Database["public"]["Enums"]["notification_type"]
          p_title: string
          p_message: string
          p_metadata?: Json
          p_market_id?: string
        }
        Returns: Json
      }
      create_prediction_market: {
        Args:
          | { p_title: string; p_description: string; p_end_date: string }
          | {
              p_title: string
              p_description: string
              p_end_date: string
              p_category_id: string
            }
          | {
              p_title: string
              p_description: string
              p_end_date: string
              p_category_id: string
              p_creator_fee_percentage?: number
            }
        Returns: string
      }
      create_user_notification: {
        Args: {
          p_user_id: string
          p_type: Database["public"]["Enums"]["notification_type"]
          p_title: string
          p_message: string
          p_market_id?: string
          p_metadata?: Json
        }
        Returns: string
      }
      distribute_market_fees_and_rewards: {
        Args: { p_market_id: string }
        Returns: Json
      }
      distribute_market_payouts: {
        Args: { market_id: string }
        Returns: undefined
      }
      distribute_prediction_market_payouts: {
        Args: { p_market_id: string }
        Returns: Json
      }
      distribute_voting_rewards: {
        Args: { p_market_id: string }
        Returns: undefined
      }
      ensure_market_fields: {
        Args: { p_market_id: string }
        Returns: undefined
      }
      evaluate_pai_gow_hand: {
        Args: { cards: Json }
        Returns: Json
      }
      exec_sql: {
        Args: { sql: string }
        Returns: Json
      }
      find_game_by_type: {
        Args: { p_game_type: string }
        Returns: string
      }
      force_update_market_status: {
        Args: { p_market_id: string; p_status: string }
        Returns: boolean
      }
      generate_baccarat_shoe: {
        Args: { server_seed: string; client_seed: string }
        Returns: Json[]
      }
      generate_coin_flip: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      generate_dummy_data: {
        Args: { p_game_type: string; p_data_count?: number; p_user_id?: string }
        Returns: Json
      }
      get_active_market_configuration: {
        Args: Record<PropertyKey, never>
        Returns: {
          bet_fee_amount: number
          created_at: string
          creator_fee_percentage: number
          id: string
          is_active: boolean
          market_creation_cost: number
          max_bet_amount: number
          min_bet_amount: number
          total_pool_fee_percentage: number | null
          updated_at: string
          updated_by: string | null
          voter_fee_percentage: number
          voting_period_hours: number
        }
      }
      get_analytics_monitoring: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_analytics_performance_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          job_name: string
          total_runs: number
          successful_runs: number
          failed_runs: number
          avg_duration_seconds: number
          max_duration_seconds: number
          total_rows_processed: number
          avg_memory_usage_mb: number
          avg_lock_wait_ms: number
          avg_data_processed_mb: number
          last_successful_run: string
          last_failed_run: string
        }[]
      }
      get_card_value: {
        Args: { rank: string }
        Returns: number
      }
      get_database_metrics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_game_analytics: {
        Args: { p_game_type: string }
        Returns: Json
      }
      get_game_settings: {
        Args: { p_game_type: string }
        Returns: Json
      }
      get_game_top_players: {
        Args: { p_game_type: string }
        Returns: Json
      }
      get_market_analytics: {
        Args: { p_market_id: string }
        Returns: Database["public"]["CompositeTypes"]["analytics_record"]
      }
      get_market_creation_cost: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_market_fee_analytics: {
        Args: { p_market_id: string }
        Returns: {
          total_fees_collected: number
          creator_fees_distributed: number
          platform_fees_collected: number
          updated_at: string
        }[]
      }
      get_market_resolution_analytics: {
        Args: { p_market_id: string }
        Returns: {
          resolution_time_seconds: number
          votes_aligned_with_outcome: boolean
          total_participating_stake: number
          updated_at: string
        }[]
      }
      get_market_statistics: {
        Args: { p_market_id: string }
        Returns: {
          unique_participants: number
          total_volume: number
          total_bets: number
          yes_percentage: number
          no_percentage: number
        }[]
      }
      get_market_voting_analytics: {
        Args: { p_market_id: string }
        Returns: {
          total_votes: number
          yes_votes: number
          no_votes: number
          unique_voters: number
          updated_at: string
        }[]
      }
      get_rate_limit_remaining: {
        Args: {
          p_user_id: string
          p_ip_address: string
          p_action_type: Database["public"]["Enums"]["game_action_type"]
          p_max_requests: number
        }
        Returns: number
      }
      handle_baccarat_bet: {
        Args: {
          player_id: string
          bet_amount: number
          bet_type: string
          client_seed: string
        }
        Returns: Json
      }
      handle_coin_flip_bet: {
        Args: {
          player_id: string
          bet_amount: number
          player_choice: boolean
          game_result?: boolean
        }
        Returns: Json
      }
      handle_multiple_baccarat_bets: {
        Args: { player_id: string; bets: Json; client_seed: string }
        Returns: Json
      }
      handle_pai_gow_bet: {
        Args: { player_id: string; bet_amount: number; game_result?: string }
        Returns: boolean
      }
      handle_provably_fair_coin_flip: {
        Args: {
          player_id: string
          client_seed: string
          bet_amount: number
          player_choice: boolean
        }
        Returns: Json
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      increment: {
        Args: { row_id: string; column_name: string }
        Returns: undefined
      }
      initialize_baccarat_shoe: {
        Args: { num_decks?: number }
        Returns: Json
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_pair: {
        Args: { hand: Json }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          action_type: string
          target_table: string
          target_id: string
          changes: Json
        }
        Returns: undefined
      }
      log_admin_market_action: {
        Args: {
          p_market_id: string
          p_admin_id: string
          p_action_type: string
          p_action_details: Json
        }
        Returns: undefined
      }
      log_analytics_performance: {
        Args: {
          p_job_name: string
          p_status: string
          p_error_message?: string
          p_rows_processed?: number
          p_performance_metrics?: Json
        }
        Returns: undefined
      }
      make_user_admin: {
        Args: { target_user_id: string }
        Returns: Json
      }
      place_bet_transaction: {
        Args: {
          p_market_id: string
          p_position: boolean
          p_amount: number
          p_user_id: string
        }
        Returns: Json
      }
      place_prediction_bet: {
        Args: {
          p_market_id: string
          p_position: boolean
          p_amount: number
          p_odds: number
          p_user_id: string
        }
        Returns: boolean
      }
      process_pending_fee_distribution: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      record_market_interaction: {
        Args: { p_market_id: string; p_user_id: string }
        Returns: boolean
      }
      remove_user_admin: {
        Args: { target_user_id: string }
        Returns: Json
      }
      resolve_baccarat_game: {
        Args: {
          game_state_id: string
          player_cards: Json
          banker_cards: Json
          winner: string
        }
        Returns: Json
      }
      resolve_prediction_market: {
        Args: { market_id: string; outcome: boolean }
        Returns: undefined
      }
      retry_failed_fee_distribution: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      retry_fee_distribution: {
        Args: { fee_id: string }
        Returns: boolean
      }
      rollback_transaction: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      should_draw_third_card: {
        Args: {
          player_total: number
          banker_total: number
          is_player: boolean
          player_third_card?: Json
        }
        Returns: boolean
      }
      submit_market_vote: {
        Args: { p_market_id: string; p_user_id: string; p_vote: boolean }
        Returns: boolean
      }
      sync_market_bets: {
        Args: { p_market_id: string }
        Returns: Json
      }
      update_balance: {
        Args: { amount: number; user_id: string }
        Returns: undefined
      }
      update_category_performance: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_daily_analytics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_daily_user_engagement: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_expired_markets: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_game_settings: {
        Args: {
          p_game_id: string
          p_min_bet: number
          p_max_bet: number
          p_settings: Json
        }
        Returns: Json
      }
      update_market_configuration: {
        Args:
          | {
              p_market_creation_cost: number
              p_min_bet_amount: number
              p_max_bet_amount: number
              p_bet_fee_amount: number
              p_voter_fee_percentage: number
              p_creator_fee_percentage: number
            }
          | {
              p_market_creation_cost: number
              p_min_bet_amount: number
              p_max_bet_amount: number
              p_bet_fee_amount: number
              p_voter_fee_percentage: number
              p_creator_fee_percentage: number
              p_voting_period_hours: number
            }
          | {
              p_market_creation_cost: number
              p_min_bet_amount: number
              p_max_bet_amount: number
              p_bet_fee_amount: number
              p_voter_fee_percentage: number
              p_creator_fee_percentage: number
              p_voting_period_hours: number
              p_total_pool_fee_percentage: number
            }
        Returns: {
          bet_fee_amount: number
          created_at: string
          creator_fee_percentage: number
          id: string
          is_active: boolean
          market_creation_cost: number
          max_bet_amount: number
          min_bet_amount: number
          total_pool_fee_percentage: number | null
          updated_at: string
          updated_by: string | null
          voter_fee_percentage: number
          voting_period_hours: number
        }
      }
      update_market_statuses: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      update_market_vote_counts: {
        Args: { p_market_id: string }
        Returns: undefined
      }
      update_payout_status: {
        Args: {
          p_payout_id: string
          p_status: string
          p_admin_notes?: string
          p_transaction_hash?: string
        }
        Returns: {
          admin_id: string | null
          admin_notes: string | null
          amount: number
          completed_at: string | null
          created_at: string | null
          crypto_currency: Database["public"]["Enums"]["crypto_currency"]
          id: string
          status: string
          transaction_hash: string | null
          updated_at: string | null
          user_id: string
          wallet_address: string
        }
      }
      update_pool_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_position_risk_scores: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_risk_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      validate_bet_amount: {
        Args: { p_market_id: string; p_position: boolean; p_amount: number }
        Returns: boolean
      }
      validate_bet_timing: {
        Args: { p_market_id: string }
        Returns: boolean
      }
      validate_market_for_betting: {
        Args: { p_market_id: string }
        Returns: Json
      }
      validate_pai_gow_arrangement: {
        Args: { high_hand: Json; low_hand: Json }
        Returns: boolean
      }
      validate_pool_balance: {
        Args: { p_market_id: string; p_position: boolean; p_amount: number }
        Returns: boolean
      }
      verify_coin_flip: {
        Args: { server_seed: string; client_seed: string }
        Returns: boolean
      }
    }
    Enums: {
      admin_permission:
        | "manage_users"
        | "manage_markets"
        | "manage_games"
        | "manage_transactions"
        | "manage_payouts"
        | "view_analytics"
        | "manage_fees"
        | "manage_roles"
      analytics_alert_type: "performance" | "error" | "threshold" | "system"
      analytics_job_status: "active" | "stopped" | "error"
      app_role: "admin" | "moderator" | "user"
      bet_status: "pending" | "won" | "lost" | "refunded"
      card_rank:
        | "2"
        | "3"
        | "4"
        | "5"
        | "6"
        | "7"
        | "8"
        | "9"
        | "10"
        | "J"
        | "Q"
        | "K"
        | "A"
      card_suit: "hearts" | "diamonds" | "clubs" | "spades"
      crypto_currency: "BTC" | "ADA" | "ETH" | "BNB" | "MATIC" | "SOL" | "TRX"
      crypto_verification_status:
        | "pending"
        | "verified"
        | "rejected"
        | "expired"
      dispute_status: "pending" | "under_review" | "resolved" | "rejected"
      game_action_type:
        | "coin_flip"
        | "dice"
        | "wheel_spin"
        | "blackjack"
        | "baccarat"
        | "pai_gow_poker"
        | "roulette"
        | "craps"
        | "sports_bet_pregame"
        | "sports_bet_live"
        | "sports_bet_parlay"
        | "place_prediction_bet"
        | "close_prediction_bet"
        | "withdraw"
        | "deposit"
        | "prediction_bet"
        | "analytics_admin"
        | "create_market"
      game_status: "active" | "disabled" | "maintenance"
      game_type:
        | "blackjack"
        | "roulette"
        | "craps"
        | "baccarat"
        | "pai_gow_poker"
        | "sports"
        | "dice"
        | "coin_flip"
        | "wheel_spin"
      notification_type:
        | "market_state_change"
        | "voting_started"
        | "voting_ended"
        | "resolution_complete"
        | "fee_distribution"
        | "reward_available"
      rate_limit_action:
        | "blackjack"
        | "roulette"
        | "craps"
        | "baccarat"
        | "pai_gow_poker"
        | "dice"
        | "coin_flip"
        | "wheel_spin"
        | "sports_bet_pregame"
        | "sports_bet_live"
        | "sports_bet_parlay"
        | "analytics_admin"
        | "prediction_bet"
        | "create_market"
        | "withdraw"
      risk_level: "low" | "medium" | "high"
      sport_type:
        | "football"
        | "basketball"
        | "baseball"
        | "hockey"
        | "soccer"
        | "tennis"
        | "mma"
      ticket_category:
        | "Balance Issues"
        | "Game Malfunction"
        | "Account Issues"
        | "Technical Problems"
        | "Other"
      ticket_status: "open" | "resolved"
      transaction_status: "pending" | "completed" | "failed"
      transaction_type: "deposit" | "withdrawal" | "bet" | "win"
    }
    CompositeTypes: {
      analytics_record: {
        total_votes: number | null
        yes_votes: number | null
        no_votes: number | null
        unique_voters: number | null
        total_fees: number | null
        resolution_time: number | null
      }
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
      admin_permission: [
        "manage_users",
        "manage_markets",
        "manage_games",
        "manage_transactions",
        "manage_payouts",
        "view_analytics",
        "manage_fees",
        "manage_roles",
      ],
      analytics_alert_type: ["performance", "error", "threshold", "system"],
      analytics_job_status: ["active", "stopped", "error"],
      app_role: ["admin", "moderator", "user"],
      bet_status: ["pending", "won", "lost", "refunded"],
      card_rank: [
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "J",
        "Q",
        "K",
        "A",
      ],
      card_suit: ["hearts", "diamonds", "clubs", "spades"],
      crypto_currency: ["BTC", "ADA", "ETH", "BNB", "MATIC", "SOL", "TRX"],
      crypto_verification_status: [
        "pending",
        "verified",
        "rejected",
        "expired",
      ],
      dispute_status: ["pending", "under_review", "resolved", "rejected"],
      game_action_type: [
        "coin_flip",
        "dice",
        "wheel_spin",
        "blackjack",
        "baccarat",
        "pai_gow_poker",
        "roulette",
        "craps",
        "sports_bet_pregame",
        "sports_bet_live",
        "sports_bet_parlay",
        "place_prediction_bet",
        "close_prediction_bet",
        "withdraw",
        "deposit",
        "prediction_bet",
        "analytics_admin",
        "create_market",
      ],
      game_status: ["active", "disabled", "maintenance"],
      game_type: [
        "blackjack",
        "roulette",
        "craps",
        "baccarat",
        "pai_gow_poker",
        "sports",
        "dice",
        "coin_flip",
        "wheel_spin",
      ],
      notification_type: [
        "market_state_change",
        "voting_started",
        "voting_ended",
        "resolution_complete",
        "fee_distribution",
        "reward_available",
      ],
      rate_limit_action: [
        "blackjack",
        "roulette",
        "craps",
        "baccarat",
        "pai_gow_poker",
        "dice",
        "coin_flip",
        "wheel_spin",
        "sports_bet_pregame",
        "sports_bet_live",
        "sports_bet_parlay",
        "analytics_admin",
        "prediction_bet",
        "create_market",
        "withdraw",
      ],
      risk_level: ["low", "medium", "high"],
      sport_type: [
        "football",
        "basketball",
        "baseball",
        "hockey",
        "soccer",
        "tennis",
        "mma",
      ],
      ticket_category: [
        "Balance Issues",
        "Game Malfunction",
        "Account Issues",
        "Technical Problems",
        "Other",
      ],
      ticket_status: ["open", "resolved"],
      transaction_status: ["pending", "completed", "failed"],
      transaction_type: ["deposit", "withdrawal", "bet", "win"],
    },
  },
} as const
