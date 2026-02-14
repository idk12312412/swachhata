import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getRankInfo } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";

const Leaderboard = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, points, rank")
        .order("points", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Trophy className="w-6 h-6" /> Leaderboard
        </h1>
      </motion.div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : (
            users?.map((user, i) => {
              const info = getRankInfo(user.points);
              return (
                <div
                  key={i}
                  className={`flex items-center gap-4 px-4 py-3 ${i !== (users.length - 1) ? "border-b" : ""}`}
                >
                  <span className={`text-lg font-bold w-8 ${i < 3 ? "text-accent" : "text-muted-foreground"}`}>
                    #{i + 1}
                  </span>
                  <span className="text-xl">{info.emoji}</span>
                  <div className="flex-1">
                    <p className="font-medium">{user.display_name || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">{info.rank}</p>
                  </div>
                  <span className="font-bold text-primary">{user.points} pts</span>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;
