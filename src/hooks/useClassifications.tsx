import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useClassifications = (limit?: number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["classifications", user?.id, limit],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from("classifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (limit) query = query.limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
};

export const useFlaggedClassifications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["flagged-classifications"],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("classifications")
        .select("*")
        .eq("is_flagged", true)
        .is("classification_type", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });
};

export const useStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["stats", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("classifications")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      const items = data ?? [];
      const totalCo2 = items.reduce((sum, i) => sum + Number(i.co2_saved), 0);
      const materialBreakdown: Record<string, number> = {};
      const weeklyData: Record<string, number> = {};
      items.forEach((item) => {
        const mat = item.material_type || "Unknown";
        materialBreakdown[mat] = (materialBreakdown[mat] || 0) + 1;
        const week = new Date(item.created_at).toISOString().slice(0, 10);
        weeklyData[week] = (weeklyData[week] || 0) + 1;
      });
      return { totalItems: items.length, totalCo2, materialBreakdown, weeklyData, items };
    },
    enabled: !!user,
  });
};
