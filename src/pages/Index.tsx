import { Link } from "react-router-dom";
import { useProfile, getRankInfo } from "@/hooks/useProfile";
import { useClassifications } from "@/hooks/useClassifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Camera, Recycle, RotateCcw, Package, Trash2, Leaf, TrendingUp, TreePine, History, Truck, Image } from "lucide-react";
import { motion } from "framer-motion";

const classificationIcons: Record<string, any> = {
  recycle: Recycle,
  reuse: RotateCcw,
  keep: Package,
  dispose: Trash2,
};

const Index = () => {
  const { profile } = useProfile();
  const { data: recentItems } = useClassifications(5);
  const rankInfo = getRankInfo(profile?.points ?? 0);

  const totalCo2 = recentItems?.reduce((sum, i) => sum + Number(i.co2_saved), 0) ?? 0;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6 overflow-x-hidden">
      {/* Welcome Banner */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-primary text-primary-foreground overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-primary-foreground/80 text-sm">Welcome back,</p>
                <h1 className="text-3xl md:text-4xl font-display font-extrabold mt-1">
                  {profile?.display_name || "Eco Warrior"} {rankInfo.emoji}
                </h1>
                <p className="mt-2 text-sm text-primary-foreground/70">
                  {rankInfo.rank} · {profile?.points ?? 0} points
                </p>
                {rankInfo.next && (
                  <div className="mt-3 max-w-[200px]">
                    <Progress value={rankInfo.progress} className="h-2 bg-primary-foreground/20" />
                    <p className="text-xs mt-1 text-primary-foreground/60">{rankInfo.next - (profile?.points ?? 0)} pts to next rank</p>
                  </div>
                )}
              </div>
              <TreePine className="w-16 h-16 text-primary-foreground/10 absolute right-4 top-4" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Link to="/classify">
          <Button size="lg" className="w-full gap-3 text-base h-14 shadow-lg">
            <Camera className="w-5 h-5" />
            Classify Waste Item
          </Button>
        </Link>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        className="grid grid-cols-3 gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-4 text-center">
            <Recycle className="w-5 h-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold font-display">{recentItems?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Leaf className="w-5 h-5 mx-auto text-eco-leaf mb-1" />
            <p className="text-2xl font-bold font-display">{totalCo2.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">kg CO₂</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-5 h-5 mx-auto text-accent mb-1" />
            <p className="text-2xl font-bold font-display">{profile?.points ?? 0}</p>
            <p className="text-xs text-muted-foreground">Points</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        className="grid grid-cols-2 gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Link to="/recycling-trip">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <Truck className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="font-medium text-sm">Trip Planner</p>
                <p className="text-xs text-muted-foreground">Plan recycling visits</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/gallery">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <Image className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="font-medium text-sm">Gallery</p>
                <p className="text-xs text-muted-foreground">View classified items</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <History className="w-4 h-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(!recentItems || recentItems.length === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No items classified yet. Start by uploading a waste photo!
              </p>
            ) : (
              recentItems.map((item) => {
                const Icon = classificationIcons[item.classification_type ?? ""] || Recycle;
                return (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    {item.image_url && (
                      <img src={item.image_url} alt="" className="w-10 h-10 rounded-md object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.item_description || "Waste item"}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.material_type} · {Number(item.co2_saved).toFixed(2)} kg CO₂
                      </p>
                    </div>
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                );
              })
            )}
            {recentItems && recentItems.length > 0 && (
              <Link to="/history">
                <Button variant="ghost" size="sm" className="w-full">View All History</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Index;
