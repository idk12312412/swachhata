import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { PenSquare, ArrowLeft, Upload, Loader2, Image as ImageIcon, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Gallery = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [posting, setPosting] = useState(false);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      // Fetch author names
      const userIds = [...new Set((data ?? []).map((p: any) => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);
      const nameMap: Record<string, string> = {};
      (profiles ?? []).forEach((p: any) => { nameMap[p.user_id] = p.display_name || "Anonymous"; });
      return (data ?? []).map((p: any) => ({ ...p, author: nameMap[p.user_id] || "Anonymous" }));
    },
  });

  const createPost = async () => {
    if (!user || !title.trim() || !body.trim()) return;
    setPosting(true);
    try {
      let imageUrl: string | null = null;
      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `blog/${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("waste-images").upload(path, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("waste-images").getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("blog_posts").insert({
        user_id: user.id,
        title: title.trim(),
        body: body.trim(),
        image_url: imageUrl,
      });
      if (error) throw error;

      // Award points
      const points = 10;
      await supabase.from("points_history").insert({
        user_id: user.id,
        points,
        reason: `Blog post: ${title.trim()}`,
      });
      const { data: profile } = await supabase.from("profiles").select("points").eq("user_id", user.id).single();
      if (profile) {
        await supabase.from("profiles").update({ points: profile.points + points }).eq("user_id", user.id);
      }

      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      toast({ title: "Post published!", description: `+${points} points earned!` });
      setShowNew(false);
      setTitle("");
      setBody("");
      setImageFile(null);
      setImagePreview("");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  const handleImageSelect = (f: File) => {
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6 overflow-x-hidden">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <PenSquare className="w-6 h-6" /> Community Blog
          </h1>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setShowNew(true)}>
          <Plus className="w-4 h-4" /> New Post
        </Button>
      </motion.div>

      {isLoading ? (
        <p className="text-center py-8 text-muted-foreground">Loading...</p>
      ) : !posts?.length ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No posts yet. Be the first to share!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post: any, i: number) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <CardContent className="p-4 space-y-3">
                  {post.image_url && (
                    <div className="rounded-lg overflow-hidden bg-muted aspect-video">
                      <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-display font-bold text-lg text-card-foreground">{post.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{post.body}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>By {post.author}</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* New Post Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-[90vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Blog Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea placeholder="Write your post..." value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-cover rounded-lg" />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => { setImageFile(null); setImagePreview(""); }}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <Button variant="outline" className="gap-2 w-full" onClick={() => fileInputRef.current?.click()}>
                <ImageIcon className="w-4 h-4" /> Add Image (optional)
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={createPost} disabled={posting || !title.trim() || !body.trim()} className="gap-2">
              {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;
