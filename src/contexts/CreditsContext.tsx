import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserCredits } from "@/hooks/useCredits";

interface CreditsContextType {
  credits: UserCredits | undefined;
  isLoading: boolean;
  refetchCredits: () => void;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

interface CreditsProviderProps {
  children: ReactNode;
  userId: string;
}

export const CreditsProvider = ({ children, userId }: CreditsProviderProps) => {
  const queryClient = useQueryClient();
  
  const { data: credits, isLoading, refetch } = useQuery<UserCredits>({
    queryKey: ["user-credits", userId],
    queryFn: async () => {
      console.log("🏦 [CreditsProvider] Fetching credits for user:", userId);
      
      const { data, error } = await (supabase as any)
        .from("user_credits")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (error) {
        console.log("Credits fetch error:", error);
        if (error.code === 'PGRST116') {
          return { 
            id: '', 
            user_id: userId, 
            balance: 0, 
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as UserCredits;
        }
        throw error;
      }
      
      console.log("✅ [CreditsProvider] Credits data:", data);
      return data as UserCredits;
    },
    enabled: !!userId,
    staleTime: 30000, // 30 seconds
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });

  const refetchCredits = () => {
    console.log("🔄 [CreditsProvider] Manual refetch triggered");
    refetch();
  };

  return (
    <CreditsContext.Provider value={{ credits, isLoading, refetchCredits }}>
      {children}
    </CreditsContext.Provider>
  );
};

export const useCreditsContext = () => {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error('useCreditsContext must be used within a CreditsProvider');
  }
  return context;
};