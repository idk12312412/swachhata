import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: { display_name?: string; avatar_url?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profile"] }),
  });

  return { profile, isLoading, updateProfile };
};

export const getRankInfo = (points: number) => {
  if (points >= 10000) return { rank: "Guardian of Earth", emoji: "🌍", next: null, progress: 100 };
  if (points >= 5000) return { rank: "Forest", emoji: "🌲", next: 10000, progress: ((points - 5000) / 5000) * 100 };
  if (points >= 2000) return { rank: "Tree", emoji: "🌳", next: 5000, progress: ((points - 2000) / 3000) * 100 };
  if (points >= 500) return { rank: "Sapling", emoji: "🌱", next: 2000, progress: ((points - 500) / 1500) * 100 };
  return { rank: "Seedling", emoji: "🌿", next: 500, progress: (points / 500) * 100 };
};
