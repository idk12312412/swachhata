import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, getRankInfo } from "@/hooks/useProfile";
import { useStats } from "@/hooks/useClassifications";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { User, Leaf, Recycle, Trophy, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const Profile = () => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { data: stats } = useStats();
  const { toast } = useToast();
  const rankInfo = getRankInfo(profile?.points ?? 0);

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile.mutateAsync({ display_name: displayName });
      toast({ title: "Profile updated!" });
    } catch {
      toast({ title: "Error saving profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Rank Card */}
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-6 text-center">
            <span className="text-5xl">{rankInfo.emoji}</span>
            <h2 className="text-xl font-display font-bold mt-2">{rankInfo.rank}</h2>
            <p className="text-sm text-primary-foreground/70 mt-1">{profile?.points ?? 0} points</p>
            {rankInfo.next && (
              <div className="max-w-[250px] mx-auto mt-3">
                <Progress value={rankInfo.progress} className="h-2 bg-primary-foreground/20" />
                <p className="text-xs mt-1 text-primary-foreground/60">
                  {rankInfo.next - (profile?.points ?? 0)} pts to {getRankInfo(rankInfo.next).rank}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Recycle className="w-5 h-5 mx-auto text-primary mb-1" />
            <p className="text-xl font-bold">{stats?.totalItems ?? 0}</p>
            <p className="text-xs text-muted-foreground">Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Leaf className="w-5 h-5 mx-auto text-eco-leaf mb-1" />
            <p className="text-xl font-bold">{(stats?.totalCo2 ?? 0).toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">kg CO₂</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-5 h-5 mx-auto text-accent mb-1" />
            <p className="text-xl font-bold">{profile?.points ?? 0}</p>
            <p className="text-xs text-muted-foreground">Points</p>
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-4 h-4" /> Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Display Name</label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" />
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
