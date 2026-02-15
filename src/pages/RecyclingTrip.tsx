import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Truck, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  { value: "plastic", label: "Plastic", threshold: 5 },
  { value: "glass", label: "Glass", threshold: 3 },
  { value: "paper", label: "Paper/Cardboard", threshold: 8 },
  { value: "metal", label: "Metal", threshold: 4 },
  { value: "e-waste", label: "E-waste", threshold: 2 },
  { value: "organic", label: "Organic", threshold: 10 },
  { value: "mixed", label: "Mixed", threshold: 6 },
];

const RecyclingTrip = () => {
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");
  const [result, setResult] = useState<{ days: number; progress: number } | null>(null);

  const estimate = () => {
    const cat = categories.find((c) => c.value === category);
    if (!cat || !quantity) return;
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) return;
    const progress = Math.min((qty / cat.threshold) * 100, 100);
    const daysLeft = progress >= 100 ? 0 : Math.ceil(((cat.threshold - qty) / cat.threshold) * 7);
    setResult({ days: daysLeft, progress });
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6 overflow-x-hidden">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Truck className="w-6 h-6" /> Recycling Trip Planner
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Estimate when to visit your recycling center</p>
      </motion.div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Trash category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Estimated quantity (kg)</label>
            <Input type="number" min="0" step="0.5" placeholder="e.g. 3" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </div>
          <Button className="w-full gap-2" onClick={estimate} disabled={!category || !quantity}>
            <Truck className="w-4 h-4" /> Get Recommendation
          </Button>
        </CardContent>
      </Card>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={result.days === 0 ? "border-primary/40 bg-primary/5" : ""}>
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-3xl font-display font-bold">
                  {result.days === 0 ? "🚛 Time to recycle!" : `📅 Recycle in ~${result.days} days`}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {result.days === 0
                    ? "You've accumulated enough – visit your nearest recycling center."
                    : "Keep collecting, you're almost there!"}
                </p>
              </div>
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Accumulation</span>
                  <span>{Math.round(result.progress)}%</span>
                </div>
                <Progress value={result.progress} className="h-3" />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Nearby Centers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Recycling center suggestions coming soon. Check your local municipality website for drop-off locations.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default RecyclingTrip;
