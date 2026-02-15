import { useState } from "react";
import { useClassifications } from "@/hooks/useClassifications";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Recycle, RotateCcw, Package, Trash2, Search, History, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

const icons: Record<string, any> = { recycle: Recycle, reuse: RotateCcw, keep: Package, dispose: Trash2 };

const HistoryPage = () => {
  const { data: items, isLoading } = useClassifications();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [clearOpen, setClearOpen] = useState(false);

  const filtered = items?.filter((item) => {
    const matchSearch =
      !search ||
      item.item_description?.toLowerCase().includes(search.toLowerCase()) ||
      item.material_type?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || item.classification_type === filter;
    return matchSearch && matchFilter;
  });

  const deleteItem = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("classifications").delete().eq("id", id).eq("user_id", user.id);
    if (error) {
      toast({ title: "Error deleting", description: error.message, variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["classifications"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast({ title: "Item deleted" });
    }
  };

  const clearAll = async () => {
    if (!user) return;
    const { error } = await supabase.from("classifications").delete().eq("user_id", user.id);
    if (error) {
      toast({ title: "Error clearing", description: error.message, variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["classifications"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast({ title: "All items cleared" });
    }
    setClearOpen(false);
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6 overflow-x-hidden">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <History className="w-6 h-6" /> Classification History
          </h1>
          {items && items.length > 0 && (
            <Dialog open={clearOpen} onOpenChange={setClearOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-1">
                  <Trash2 className="w-3 h-3" /> Clear All
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[90vw] sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Clear all items?</DialogTitle>
                  <DialogDescription>This will permanently delete all your classified items. This action cannot be undone.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setClearOpen(false)}>Cancel</Button>
                  <Button variant="destructive" onClick={clearAll}>Delete All</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </motion.div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search items..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="recycle">Recycle</SelectItem>
            <SelectItem value="reuse">Reuse</SelectItem>
            <SelectItem value="keep">Keep</SelectItem>
            <SelectItem value="dispose">Dispose</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : !filtered?.length ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No items found. Start classifying waste to build your history!
            </CardContent>
          </Card>
        ) : (
          filtered.map((item, i) => {
            const Icon = icons[item.classification_type ?? ""] || Recycle;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card>
                  <CardContent className="p-4 flex items-center gap-4">
                    {item.image_url && (
                      <img src={item.image_url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.item_description || "Waste item"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.material_type} · {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Icon className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium capitalize">{item.classification_type || "Pending"}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{Number(item.co2_saved).toFixed(2)} kg CO₂</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteItem(item.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
