import { useFlaggedClassifications } from "@/hooks/useClassifications";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Recycle, RotateCcw, Package, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";

const HumanClassifier = () => {
  const { data: flagged, isLoading } = useFlaggedClassifications();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [materials, setMaterials] = useState<Record<string, string>>({});

  const classify = async (id: string, classification_type: string) => {
    if (!user) return;
    const material = materials[id] || "mixed";
    const co2Map: Record<string, number> = { recycle: 2.5, reuse: 3.0, keep: 0.5, dispose: 0.1 };

    try {
      await supabase
        .from("classifications")
        .update({
          classification_type,
          material_type: material,
          co2_saved: co2Map[classification_type] ?? 0.5,
          is_flagged: false,
          classified_by: user.id,
          confidence: 1.0,
        })
        .eq("id", id);

      // Award points to original user
      const item = flagged?.find((f) => f.id === id);
      if (item) {
        const points = Math.round((co2Map[classification_type] ?? 0.5) * 10) + 5;
        await supabase.from("points_history").insert({
          user_id: item.user_id,
          points,
          reason: `Human classified: ${item.item_description || "Waste item"}`,
          classification_id: id,
        });
        const { data: profile } = await supabase
          .from("profiles")
          .select("points")
          .eq("user_id", item.user_id)
          .single();
        if (profile) {
          await supabase
            .from("profiles")
            .update({ points: profile.points + points })
            .eq("user_id", item.user_id);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["flagged-classifications"] });
      toast({ title: "Item classified!", description: "Points awarded to the user." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="container max-w-3xl mx-auto px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Shield className="w-6 h-6" /> Human Classifier Queue
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Review items the AI couldn't confidently classify</p>
      </motion.div>

      {isLoading ? (
        <p className="text-center py-8 text-muted-foreground">Loading...</p>
      ) : !flagged?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            🎉 No items in queue! The AI is doing great.
          </CardContent>
        </Card>
      ) : (
        flagged.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex gap-4">
                  {item.image_url && (
                    <img src={item.image_url} alt="" className="w-24 h-24 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.item_description || "Unknown item"}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Confidence: {((item.confidence ?? 0) * 100).toFixed(0)}% ·{" "}
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Select value={materials[item.id] || ""} onValueChange={(v) => setMaterials((p) => ({ ...p, [item.id]: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select material type" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Plastic", "Glass", "Paper", "Metal", "Organic", "E-waste", "Textile", "Mixed"].map((m) => (
                      <SelectItem key={m} value={m.toLowerCase()}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 gap-1" onClick={() => classify(item.id, "recycle")}>
                    <Recycle className="w-3 h-3" /> Recycle
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => classify(item.id, "reuse")}>
                    <RotateCcw className="w-3 h-3" /> Reuse
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => classify(item.id, "keep")}>
                    <Package className="w-3 h-3" /> Keep
                  </Button>
                  <Button size="sm" variant="secondary" className="flex-1 gap-1" onClick={() => classify(item.id, "dispose")}>
                    <Trash2 className="w-3 h-3" /> Dispose
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  );
};

export default HumanClassifier;
