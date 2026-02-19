import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2, Recycle, RotateCcw, Package, Trash2, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

type ClassificationResult = {
  classification_type: string;
  material_type: string;
  co2_saved: number;
  confidence: number;
  item_description: string;
  recycling_steps: string;
  is_flagged: boolean;
  condition_warning?: string;
};

const typeConfig: Record<string, { icon: any; color: string; label: string }> = {
  recycle: { icon: Recycle, color: "text-primary", label: "Recycle ♻️" },
  reuse: { icon: RotateCcw, color: "text-eco-sky", label: "Reuse 🔄" },
  keep: { icon: Package, color: "text-accent", label: "Keep 📦" },
  dispose: { icon: Trash2, color: "text-destructive", label: "Dispose 🗑️" },
};

const Classify = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [selfClassified, setSelfClassified] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleFile = (f: File) => {
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setSelfClassified(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  };

  const classify = async () => {
    if (!file || !user) return;
    setLoading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("waste-images").upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("waste-images").getPublicUrl(path);
      const imageUrl = urlData.publicUrl;

      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke("classify-waste", {
        body: { image_base64: base64, image_url: imageUrl },
      });
      if (error) throw error;

      const classResult = data as ClassificationResult;
      setResult(classResult);

      await supabase.from("classifications").insert({
        user_id: user.id,
        image_url: imageUrl,
        item_description: classResult.item_description,
        classification_type: classResult.is_flagged ? null : classResult.classification_type,
        material_type: classResult.material_type,
        co2_saved: classResult.co2_saved,
        confidence: classResult.confidence,
        is_flagged: classResult.is_flagged,
        recycling_steps: classResult.recycling_steps,
      });

      if (!classResult.is_flagged) {
        const points = Math.round(classResult.co2_saved * 10) + 5;
        await supabase.from("points_history").insert({
          user_id: user.id, points,
          reason: `Classified: ${classResult.item_description}`,
        });
        const { data: profile } = await supabase.from("profiles").select("points").eq("user_id", user.id).single();
        if (profile) {
          await supabase.from("profiles").update({ points: profile.points + points }).eq("user_id", user.id);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["classifications"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });

      toast({
        title: classResult.is_flagged ? "Sent for review" : "Item classified!",
        description: classResult.is_flagged
          ? "Our human classifiers will review this item."
          : `+${Math.round(classResult.co2_saved * 10) + 5} points earned!`,
      });
    } catch (error: any) {
      toast({ title: "Classification failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSelfClassify = async (type: string) => {
    setSelfClassified(true);
    toast({ title: "Thanks!", description: "Your classification has been recorded." });
  };

  const reset = () => {
    setFile(null);
    setPreview("");
    setResult(null);
    setSelfClassified(false);
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6 overflow-x-hidden">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold">Classify Waste</h1>
        <p className="text-muted-foreground text-sm mt-1">Take a photo or upload an image of your waste item</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card>
              <CardContent className="p-6">
                {!preview ? (
                  <div
                    className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary/60 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                    <p className="font-medium">Drop an image here or click to upload</p>
                    <p className="text-sm text-muted-foreground mt-1">JPG, PNG up to 10MB</p>
                    <div className="flex gap-2 justify-center mt-4 flex-wrap">
                      <Button variant="outline" size="sm" className="gap-2" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                        <Upload className="w-4 h-4" /> Browse Files
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2" onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}>
                        <Camera className="w-4 h-4" /> Take Photo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <img src={preview} alt="Waste item" className="w-full max-h-64 object-contain rounded-lg" />
                      <Button variant="secondary" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={reset}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button className="w-full gap-2" onClick={classify} disabled={loading}>
                      {loading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                      ) : (
                        <><Recycle className="w-4 h-4" /> Classify This Item</>
                      )}
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            <Card className="border-primary/30">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  {result.is_flagged ? (
                    <AlertTriangle className="w-5 h-5 text-accent" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  )}
                  <CardTitle className="text-lg">
                    {result.is_flagged ? "Needs Human Review" : "Classification Result"}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {preview && <img src={preview} alt="" className="w-full max-h-48 object-contain rounded-lg" />}

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground">Item</p>
                    <p className="font-medium text-sm">{result.item_description}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground">Material</p>
                    <p className="font-medium text-sm">{result.material_type}</p>
                  </div>
                  {!result.is_flagged && (
                    <>
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-xs text-muted-foreground">Action</p>
                        <p className={`font-medium text-sm ${typeConfig[result.classification_type]?.color}`}>
                          {typeConfig[result.classification_type]?.label}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-xs text-muted-foreground">CO₂ Saved</p>
                        <p className="font-medium text-sm">{Number(result.co2_saved).toFixed(2)} kg</p>
                      </div>
                    </>
                  )}
                </div>

                {result.condition_warning && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive font-medium">⚠️ {result.condition_warning}</p>
                  </div>
                )}

                {result.recycling_steps && !result.is_flagged && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-xs text-muted-foreground mb-1">Steps to take:</p>
                    <p className="text-sm whitespace-pre-line">{result.recycling_steps}</p>
                  </div>
                )}

                {result.is_flagged && !selfClassified && (
                  <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-sm">
                    <p>The AI couldn't confidently classify this item (confidence: {(result.confidence * 100).toFixed(0)}%).</p>
                    <p className="mt-1">It's been sent to our human classifiers for review.</p>
                    <p className="mt-2 font-medium">Want to classify it yourself?</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {["recycle", "reuse", "keep", "dispose"].map((type) => (
                        <Button
                          key={type}
                          variant="outline"
                          size="sm"
                          className="capitalize"
                          onClick={() => handleSelfClassify(type)}
                        >
                          {typeConfig[type]?.label?.split(" ")[0]}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {result.is_flagged && selfClassified && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm text-center">
                    ✅ Thanks for your classification! Points will be awarded after review.
                  </div>
                )}
              </CardContent>
            </Card>

            <Button className="w-full gap-2" onClick={reset}>
              <Camera className="w-4 h-4" /> Classify Another Item
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Classify;
