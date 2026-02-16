import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Truck, MapPin, Navigation, Loader2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import "leaflet/dist/leaflet.css";

const categories = [
  { value: "plastic", label: "Plastic", threshold: 5 },
  { value: "glass", label: "Glass", threshold: 3 },
  { value: "paper", label: "Paper/Cardboard", threshold: 8 },
  { value: "metal", label: "Metal", threshold: 4 },
  { value: "e-waste", label: "E-waste", threshold: 2 },
  { value: "organic", label: "Organic", threshold: 10 },
  { value: "mixed", label: "Mixed", threshold: 6 },
];

interface RecyclingCenter {
  id: number;
  name: string;
  lat: number;
  lon: number;
  distance: number;
  address?: string;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const RecyclingTrip = () => {
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState("");
  const [result, setResult] = useState<{ days: number; progress: number } | null>(null);

  // Map state
  const [showMap, setShowMap] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState("");
  const [centers, setCenters] = useState<RecyclingCenter[]>([]);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);

  const estimate = () => {
    const cat = categories.find((c) => c.value === category);
    if (!cat || !quantity) return;
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) return;
    const progress = Math.min((qty / cat.threshold) * 100, 100);
    const daysLeft = progress >= 100 ? 0 : Math.ceil(((cat.threshold - qty) / cat.threshold) * 7);
    setResult({ days: daysLeft, progress });
  };

  const loadMap = async () => {
    setMapLoading(true);
    setMapError("");
    setCenters([]);

    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
      const { latitude: lat, longitude: lng } = pos.coords;
      setUserPos({ lat, lng });

      // Fetch from Overpass API
      const query = `[out:json][timeout:10];node["amenity"="recycling"](around:5000,${lat},${lng});out body;`;
      const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await res.json();

      const results: RecyclingCenter[] = (data.elements || []).map((el: any) => ({
        id: el.id,
        name: el.tags?.name || "Recycling Center",
        lat: el.lat,
        lon: el.lon,
        distance: haversine(lat, lng, el.lat, el.lon),
        address: el.tags?.["addr:street"] ? `${el.tags["addr:street"]} ${el.tags["addr:housenumber"] || ""}`.trim() : undefined,
      }));
      results.sort((a, b) => a.distance - b.distance);
      setCenters(results);
      setShowMap(true);
    } catch (err: any) {
      if (err?.code === 1) {
        setMapError("Location access denied. Please enable location in your browser settings.");
      } else {
        setMapError("Could not load nearby centers. Please try again.");
      }
    } finally {
      setMapLoading(false);
    }
  };

  useEffect(() => {
    if (!showMap || !userPos || !mapRef.current) return;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
      }

      const map = L.map(mapRef.current!).setView([userPos.lat, userPos.lng], 13);
      leafletMapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // User marker
      const userIcon = L.divIcon({
        html: '<div style="background:#3b82f6;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 0 6px rgba(0,0,0,.3)"></div>',
        iconSize: [14, 14],
        className: "",
      });
      L.marker([userPos.lat, userPos.lng], { icon: userIcon }).addTo(map).bindPopup("📍 You are here");

      // Center markers
      centers.forEach((c) => {
        L.marker([c.lat, c.lon])
          .addTo(map)
          .bindPopup(
            `<strong>${c.name}</strong><br/>${c.address ? c.address + "<br/>" : ""}📏 ${c.distance.toFixed(2)} km<br/><a href="https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lon}" target="_blank" rel="noopener" style="color:#2563eb">Get Directions →</a>`
          );
      });
    };

    initMap();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [showMap, userPos, centers]);

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
        </motion.div>
      )}

      {/* Map Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Nearby Recycling Centers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!showMap && (
            <div className="text-center space-y-3 py-2">
              <p className="text-sm text-muted-foreground">Find recycling facilities within 5km of your location.</p>
              <Button onClick={loadMap} disabled={mapLoading} className="gap-2">
                {mapLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                Find Nearby Recycling Centers
              </Button>
              {mapError && <p className="text-sm text-destructive">{mapError}</p>}
            </div>
          )}

          {showMap && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Showing recycling centers within 5km of your location.</p>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setShowMap(false); loadMap(); }}>
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div ref={mapRef} className="w-full h-[350px] md:h-[450px] rounded-lg border overflow-hidden" />

              {centers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">No recycling centers found within 5km.</p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {centers.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        {c.address && <p className="text-xs text-muted-foreground">{c.address}</p>}
                        <p className="text-xs text-muted-foreground">📏 {c.distance.toFixed(2)} km away</p>
                      </div>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lon}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm" className="gap-1 shrink-0">
                          <Navigation className="w-3 h-3" /> Directions
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecyclingTrip;
