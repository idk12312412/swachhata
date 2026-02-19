import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Shield, Trash2, Edit2, Save, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";

const Admin = () => {
  const { data: isAdmin, isLoading: checkingAdmin } = useIsAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [editTarget, setEditTarget] = useState<{ user_id: string; display_name: string } | null>(null);
  const [editName, setEditName] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-actions", {
        body: { action: "list_users" },
      });
      if (error) throw error;
      return data.profiles as any[];
    },
    enabled: isAdmin === true,
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-actions", {
        body: { action: "delete_user", target_user_id: deleteTarget.id },
      });
      if (error) throw error;
      toast({ title: "User deleted" });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
      setDeleteTarget(null);
    }
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setActionLoading(true);
    try {
      const { error } = await supabase.functions.invoke("admin-actions", {
        body: { action: "update_profile", target_user_id: editTarget.user_id, updates: { display_name: editName } },
      });
      if (error) throw error;
      toast({ title: "Profile updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
      setEditTarget(null);
    }
  };

  if (checkingAdmin) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading...</div>;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6 overflow-x-hidden">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Shield className="w-6 h-6" /> Admin Panel
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Manage users and content</p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Users ({users?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : (
            users?.map((u: any) => (
              <div key={u.id} className="flex items-center gap-4 px-4 py-3 border-b last:border-b-0">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{u.display_name || "Anonymous"}</p>
                  <p className="text-xs text-muted-foreground">{u.points} pts · {u.rank}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => { setEditTarget(u); setEditName(u.display_name || ""); }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget({ id: u.user_id, name: u.display_name || "Anonymous" })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete user?</DialogTitle>
            <DialogDescription>Permanently delete "{deleteTarget?.name}" and all their data? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent className="max-w-[90vw] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>
          <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Display name" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={actionLoading} className="gap-2">
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
