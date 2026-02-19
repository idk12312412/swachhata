import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, getRankInfo } from "@/hooks/useProfile";
import { useStats } from "@/hooks/useClassifications";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { User, Leaf, Recycle, Trophy, Save, Loader2, Moon, Eye, EyeOff, Lock } from "lucide-react";
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
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  // Change password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.display_name ?? "");
  }, [profile?.display_name]);

  const toggleDark = (val: boolean) => {
    setDark(val);
    document.documentElement.classList.toggle("dark", val);
    localStorage.setItem("swacchata-theme", val ? "dark" : "light");
  };

  useEffect(() => {
    const saved = localStorage.getItem("swacchata-theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

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

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setChangingPw(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Password updated!" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
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
            <p className="text-xl font-bold">{(stats?.totalCo2 ?? 0).toFixed(2)}</p>
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
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Dark Mode</span>
            </div>
            <Switch checked={dark} onCheckedChange={toggleDark} />
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="w-4 h-4" /> Change Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <label className="text-sm text-muted-foreground">New Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                minLength={6}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Confirm Password</label>
            <Input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          <Button onClick={handleChangePassword} disabled={changingPw || !newPassword} className="gap-2">
            {changingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Update Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
