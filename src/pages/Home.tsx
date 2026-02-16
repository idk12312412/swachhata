import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Leaf, Truck, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import logoFull from "@/assets/logo-full.png";

const features = [
  { icon: Camera, title: "Smart Classification", desc: "AI-powered waste sorting with instant results" },
  { icon: Leaf, title: "CO₂ Tracking", desc: "Track your environmental impact in real time" },
  { icon: Truck, title: "Trip Planning", desc: "Know when to visit your recycling center" },
  { icon: Trophy, title: "Community Board", desc: "Compete and climb the eco leaderboard" },
];

const Home = () => (
  <div className="min-h-screen flex flex-col bg-background">
    {/* Hero */}
    <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 md:py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <img src={logoFull} alt="Swacchata" className="h-20 md:h-28 mx-auto object-contain" />
        <p className="mt-4 text-lg md:text-xl font-display font-semibold text-primary">For a greener future.</p>
        <p className="mt-3 max-w-lg mx-auto text-muted-foreground text-sm md:text-base">
          Swacchata helps you classify waste using AI, track your CO₂ savings, and plan smart recycling trips — all while earning points and climbing the community leaderboard.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/auth?mode=signup">
            <Button size="lg" className="gap-2 px-8">
              <Leaf className="w-4 h-4" /> Sign Up to Start Recycling
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="lg" variant="outline" className="px-8">Login to Continue</Button>
          </Link>
        </div>
      </motion.div>
    </section>

    {/* Features */}
    <section className="px-4 pb-16">
      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((f, i) => (
          <motion.div key={f.title} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}>
            <Card className="h-full">
              <CardContent className="p-5 text-center">
                <f.icon className="w-8 h-8 mx-auto text-primary mb-3" />
                <h3 className="font-display font-bold text-sm">{f.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  </div>
);

export default Home;
