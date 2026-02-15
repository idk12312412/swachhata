import { useState } from "react";
import { useClassifications } from "@/hooks/useClassifications";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Image } from "lucide-react";
import { motion } from "framer-motion";

const Gallery = () => {
  const { data: items, isLoading } = useClassifications();
  const [selected, setSelected] = useState<string | null>(null);

  const withImages = items?.filter((i) => i.image_url) ?? [];

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6 overflow-x-hidden">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Image className="w-6 h-6" /> Gallery
        </h1>
      </motion.div>

      {isLoading ? (
        <p className="text-center py-8 text-muted-foreground">Loading...</p>
      ) : !withImages.length ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No images yet. Classify some items to see them here!
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {withImages.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="cursor-pointer"
              onClick={() => setSelected(item.image_url)}
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img src={item.image_url} alt={item.item_description || "Classified item"} className="w-full h-full object-cover hover:scale-105 transition-transform" />
              </div>
              <p className="text-xs text-muted-foreground mt-1 truncate">{item.item_description || "Item"}</p>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-[90vw] sm:max-w-lg p-2">
          {selected && <img src={selected} alt="" className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;
