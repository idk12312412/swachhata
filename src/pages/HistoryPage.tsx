import { useState } from "react";
import { useClassifications } from "@/hooks/useClassifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Recycle, RotateCcw, Package, Trash2, Search, History } from "lucide-react";
import { motion } from "framer-motion";

const icons: Record<string, any> = { recycle: Recycle, reuse: RotateCcw, keep: Package, dispose: Trash2 };

const HistoryPage = () => {
  const { data: items, isLoading } = useClassifications();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = items?.filter((item) => {
    const matchSearch =
      !search ||
      item.item_description?.toLowerCase().includes(search.toLowerCase()) ||
      item.material_type?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || item.classification_type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <History className="w-6 h-6" /> Classification History
        </h1>
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
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium capitalize">{item.classification_type || "Pending"}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{Number(item.co2_saved).toFixed(2)} kg CO₂</p>
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
